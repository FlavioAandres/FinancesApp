const { ConfirmationEmailValues } = require("../../../constants");
const { getUser } = require("../../../shared/database/repos/user.repo");
const { scheduleMessages } = require("../../../shared/utils/sqs");
const AcceptGmailInvitation = require("./handlers/AcceptGmail");

const UrlExtractFunctions = {
  gmail: AcceptGmailInvitation,
};

const checkInvitationEmail = (emailSubject) => {
  emailSubject = emailSubject.toLowerCase();
  const hosts = Object.keys(ConfirmationEmailValues.subjects);
  return hosts.find((host) => {
    const hostSubject = ConfirmationEmailValues.subjects[host].toLowerCase();
    return emailSubject.indexOf(hostSubject) >= 0;
  });
};

const parseEmailInfo = (headers) => {
  if(headers["X-Forwarded-For"]){
    return  headers["X-Forwarded-For"].split(" ")[0] || ""
  }else if(headers["From"]){
    return (headers["From"].match(/<.*>/g)[0] || "").replace(/\<|\>/g, "") || "";
  }
  return ""; 
}

const parseHtmlWithRegex = (html)=>{
  return html.replace(/\n/ig, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style[^>]*>/ig, '')
  .replace(/<head[^>]*>[\s\S]*?<\/head[^>]*>/ig, '')
  .replace(/<script[^>]*>[\s\S]*?<\/script[^>]*>/ig, '')
  .replace(/<\/\s*(?:p|div)>/ig, '\n')
  .replace(/<br[^>]*\/?>/ig, '\n')
  .replace(/<[^>]*>/ig, '')
  .replace('&nbsp;', ' ')
  .replace(/[^\S\r\n][^\S\r\n]+/ig, ' ')
}

module.exports.run = async (event) => {
  const { body } = event;
  if (!body) {
    console.error("no body sent");
    return {
      statusCode: 400,
    };
  }
  let mandrill_events; 
  try {
      mandrill_events = JSON.parse(body.mandrill_events);
      if (!mandrill_events || !mandrill_events[0]) {
          console.log("no madrill received", body);
        return { statusCode: 400 };
      }
  } catch (error) {
      console.log("no madrill received", error);
      return {
          statusCode: 400
      }
  }
  const [{ msg: messageInfo }] = mandrill_events;
  if (!messageInfo) {
    console.log("no msg received", body);
    return { statusCode: 400 };
  }
  let { text, headers, raw_msg } = messageInfo;
  if(!text){
    console.warn({
      type: "NO_TEXT_FOUND", 
      messageInfo
    })
    text = parseHtmlWithRegex(raw_msg)
  }
  if (process.env.DEBUG) {
    console.info({
      debug: process.env.DEBUG,
      text,
      headers,
      raw_msg,
    });
  }
  const subject = headers.Subject;
  //check if is a invitation email
  const hostToAccept = checkInvitationEmail(subject);
  const queueEvent = {};
  let user;
  try {
    //Setting event type and default data according to type
    if (hostToAccept) {
      const { urlToAccept, ownerEmail: email } =
        UrlExtractFunctions[hostToAccept](text);
      queueEvent.type = "EMAIL_ACCEPT_INVITATION";
      queueEvent.email = email;
      queueEvent.data = {
        host: hostToAccept,
        url: urlToAccept,
        text,
      };
    } else {
      queueEvent.email = parseEmailInfo(headers).toLowerCase();
      queueEvent.type = "USER_PAYMENT_EVENT";

      [user] = await getUser(
        {
          email: queueEvent.email,
        },
        { banks: true }
      );

      if (!user || !user.banks || !user.banks.length) {
        console.error({ type: "NO_USER_BANK_FOUND", text, headers, user, email: queueEvent.email });
        return {
          statusCode: 200,
        };
      }
      queueEvent.user = user;
    }

    if (user && user.banks) {
        
      const selectedBank = user.banks.find(
        (bank) => {
          if (bank.subjects){
            const filteredSubjects = bank.subjects.filter(bankSubject => subject.indexOf(bankSubject) >= 0)
            return filteredSubjects.length; 
          }
          return false
        }
      );
      if (!selectedBank) {
          console.error({
            type: "NO_BANKS_FOUND_FOR_USER",
            queueEvent,
            subject,
          });
          return {
              statusCode: 200
          }
      }
      queueEvent.user.banks = undefined;
      queueEvent.data = {
        bank: selectedBank,
        text,
      };
    }

    console.log(JSON.stringify({ queueEvent }));
    const queueUrl = hostToAccept 
      ? process.env.EMAIL_FORWARDING_ACCEPT_SQS 
      : process.env.POST_INCOMING_WEBHOOK_QUEUE; 
    await scheduleMessages(
      [{ MessageBody: JSON.stringify(queueEvent), Id: Date.now().toString() }],
      queueUrl
    );
  } catch (error) {
    console.error(error);
    console.log(body);
  }

  return {
    statusCode: 200,
  };
};
