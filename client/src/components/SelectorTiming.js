import React from 'react'

const SelectorTimmingComponent = (props) => {
    return (
        <div className="container-timming-buton">
            <button
                onClick={(evt) => props.onChangeDate(evt, "week")}
                className={props.timeAgo === "week" ? "selected" : ""}
            >
                Last Week
          </button>
            <button
                onClick={(evt) => props.onChangeDate(evt, "month")}
                className={props.timeAgo === "month" ? "selected" : ""}
            >
                Last Month
          </button>
            <button
                onClick={(evt) => props.onChangeDate(evt, "year")}
                className={props.timeAgo === "year" ? "selected" : ""}
            >
                Last Year
          </button>
        </div>
    )
}

export default SelectorTimmingComponent;