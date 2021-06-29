import React from 'react'
import { Modal, Button, Steps, TextField } from 'emerald-ui/lib'
import { API } from 'aws-amplify'
import swalert from 'sweetalert2'

const UpdateEmailCredentials = (props) => {
    const [step, setStep] = React.useState(1)
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState(""); 
    const [loading, setLoading] = React.useState(false); 
    const steps = [
        <TextField onChange={(evt)=>setUsername(evt.target.value)} label="Type your email" value={username} placeholder="foo@bar.com"/>,
        <TextField onChange={(evt)=>setPassword(evt.target.value)} label="Password" value={password} type="password"/>,
        <div> <p>This application only will signin in your Email account to get the purchases notifications by your bank. This application will open your email each 20 minutes. We store your credentials in our database in a secure and encrypted way. <br /> If you click on Update, you agree with save your credentials.</p> </div>
    ]
    const nextStep = ()=>setStep(step + 1)
    const updateCredentials = (evt)=>{
        const base64Credentials = {
            user: Buffer.from(username).toString('base64'),
            key: Buffer.from(password).toString('base64')
        }
        setLoading(true)
        API.put('finances', '/user/settings/email', {
            body: {credentials: base64Credentials}
        }).then((data)=>{
            setLoading(false)
            props.close()
            setPassword("")
            swalert.fire('Email Updated', '', 'success')
            setStep(1)
        }).catch(e=>{
            console.error(e)
            setLoading(false)
            setPassword("")
            props.close()
            swalert.fire('Something went wrong', 'Take and screenshot of this and share with the administrator: ' + e.message, 'error')
        })
    }
    return (
        <Modal
            onHide={props.close}
            show={props.show}
        >
            <Modal.Header closeButton={true}>
                <Modal.Title>Update email credentials</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Steps style={{marginBottom: 30}} showLabelOnlyForCurrentStep={true} step={step} steps={['Username', 'Password', 'Confirm']} />
                {steps[step-1]}
            </Modal.Body>
            <Modal.Footer>
                {
                    step > 1 && 
                        <Button onClick={()=>setStep(step - 1)} shape="flat" color="info">
                            Back
                        </Button>
                }
                <Button loading={loading} onClick={step > 2 ? updateCredentials : nextStep} color="info">{step > 2? 'Update':'Next'}</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default UpdateEmailCredentials; 