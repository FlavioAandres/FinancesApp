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

const parseEmailInfo = (headers) =>
  headers["X-Forwarded-For"] ? headers["X-Forwarded-For"].split(" ")[0] : "";

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
  const { text, headers, raw_email } = messageInfo;
  if(!text){
    console.warn({
      type: "NO_TEXT_FOUND", 
      messageInfo
    })
  }
  if (process.env.DEBUG) {
    console.info({
      debug: process.env.DEBUG,
      text,
      headers,
      raw_email,
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
      queueEvent.email = parseEmailInfo(headers);
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
        (bank) => subject.indexOf(bank.subject) >= 0
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
