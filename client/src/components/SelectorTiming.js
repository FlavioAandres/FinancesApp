import React from 'react'

const SelectorTimmingComponent = ({ onChangeDate, timeAgo }) => {
    return (
        <div className="container-timming-buton">
            <button
                onClick={(evt) => onChangeDate(evt, "week")}
                className={timeAgo === "week" ? "selected" : ""}
            >
                Last Week
            </button>
            <button
                onClick={(evt) => onChangeDate(evt, "month")}
                className={timeAgo === "month" ? "selected" : ""}
            >
                Last Month
            </button>
            <button
                onClick={(evt) => onChangeDate(evt, "year")}
                className={timeAgo === "year" ? "selected" : ""}
            >
                Last Year
            </button>
        </div>
    )
}

export default SelectorTimmingComponent;