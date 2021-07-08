import React, { useEffect, useState } from 'react'
import { Modal, Button, SearchableSelect } from 'emerald-ui/lib'
import { API } from 'aws-amplify'
import swalert from 'sweetalert2'

const AddNewBankModal = ({ close, onBankAdded, show }) => {
    const [loading, setLoading] = useState(false)
    const [availableBanks, setBanks] = useState([]); 
    let choosedBank = ""
    const addNewBankToUser = ()=>{
        setLoading(true)
        API.patch('finances', '/user/banks', {
            body: { bankId: choosedBank }
        }).then(data=>{
            choosedBank = ""
            onBankAdded()
            swalert.fire('Bank added', 'Your new bank has been addeed and we are now tracking it', 'success')
        }).catch(e=>{
            console.error(e); 
            swalert.fire('Something went wrong', 'Take and screenshot of this and share with the administrator: ' + e.message, 'error')
        }).finally(()=>{
            setLoading(false)
            close()
        })
    }
    useEffect(() => {
        API.get('finances', '/banks').then((data) => {
            data = JSON.parse(data.body)
            setBanks(data.banks)
        }).catch(console.error)
    }, []); 
    return (
        <Modal show={show} onHide={close}>
            <Modal.Header closeButton={true}>
                <Modal.Title>Add available banks</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <SearchableSelect label="Banks" onSelect={(value)=>{choosedBank = value}} >
                    <option key={"options_empty"} disabled hidden value="">Select One...</option>
                    {availableBanks.map(item => (<option key={"options_"+item._id} value={item._id}>{item.name}</option>))}
                </SearchableSelect>
            </Modal.Body>
            <Modal.Footer>
                <Button loading={loading} onClick={addNewBankToUser} color="info">Agregar</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default AddNewBankModal;