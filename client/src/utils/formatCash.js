function formatCash(money) {
    return Intl.NumberFormat('es-co', { style: 'currency', currency: 'COP' }).format(money)
}

export default formatCash;