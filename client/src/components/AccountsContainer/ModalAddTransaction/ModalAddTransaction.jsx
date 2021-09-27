import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Modal, TextField, Button } from "emerald-ui/lib/";

const NewTransactionModal = ({ save, close, loading, show }) => {
    const { handleSubmit, formState: { errors }, control, reset } = useForm();


    const onCreateTransaction = ({ value, description, fee }) => {
        save({
            value,
            description,
            fee
        })
        reset();
    }

    return (
        <Modal onHide={close} show={show}>
            <Modal.Header closeButton={true}>
                <Modal.Title>Nueva Transacción</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleSubmit(onCreateTransaction)}>


                    <Controller
                        name="value"
                        control={control}
                        defaultValue={0}
                        rules={{ required: "This is required", min: 0 }}
                        render={({ field }) => (

                            <TextField label="Valor: "
                                onChange={field.onChange}
                                value={field.value}
                                type='number'
                                step="0.01"
                                errorMessage={errors.value && errors.value.message}
                            />
                        )}
                    />

                    <Controller
                        name="fee"
                        control={control}
                        defaultValue={0}
                        rules={{ min: 0 }}
                        render={({ field }) => (

                            <TextField label="Intereses: "
                                onChange={field.onChange}
                                value={field.value}
                                type='number'
                                step="0.01"
                                errorMessage={errors.fee && errors.fee.message}
                            />
                        )}
                    />

                    <Controller
                        name="description"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (

                            <TextField label="Descripción: "
                                onChange={field.onChange}
                                value={field.value}
                                errorMessage={errors.description && errors.description.message}
                            />
                        )}
                    />

                    <br />
                    <Button onClick={close} shape="flat" color="info">
                        Cancelar
                    </Button>
                    <Button loading={loading} color="info" type="submit">Crear Transacción</Button>
                </form>
            </Modal.Body>
            <Modal.Footer>

            </Modal.Footer>
        </Modal>
    );
};

export default NewTransactionModal;
