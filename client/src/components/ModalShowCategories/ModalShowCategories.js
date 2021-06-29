import React from 'react'
import { Modal, Button } from 'emerald-ui/lib'
import formatCash from '../../utils/formatCash';

const ModalShowCategories = (props) => {
    const {
        data = []
    } = props
    return (
        <Modal
            onHide={props.close}
            show={props.show}
        >
            <Modal.Header closeButton={true}>
                <Modal.Title> Category: <b> {props.category} </b></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {data.map(item => (
                    <div key={item._id} className="modal-category-item">
                        <div className="category-item-desc">
                            { item.category === 'withdrawal' 
                                ? item.description.substring(0, 25) 
                                : item.description.substring(0, 40)}
                        </div>
                        <div className="category-item-date">
                            {item.createdAt.substring(0, 10)}
                        </div>
                        <div className="category-item-amount">
                            {formatCash(item.amount)}
                        </div>
                    </div>))}
            </Modal.Body>
            <Modal.Footer>
                <Button shape="flat" color="info" onClick={props.close}> Cancel </Button>
            </Modal.Footer>
        </Modal>
    )
}


export default ModalShowCategories