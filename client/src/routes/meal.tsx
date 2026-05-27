import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TimeInput = () => {
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(
    new Date()
  );

  return (
    <div className="w-full max-w-md">


      <DatePicker
        selected={selectedDateTime}
        onChange={(date : any) => setSelectedDateTime(date)}
        showTimeInput
        timeInputLabel="Time:"
        dateFormat="dd/MM/yyyy HH:mm"
        className="input input-bordered w-full"
        calendarClassName="rounded-box shadow-xl border border-base-300"
        popperClassName="z-50"
        popperPlacement="bottom-start"
      />
    </div>
  );
};

export default TimeInput;