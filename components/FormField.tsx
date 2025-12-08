import React from "react";

type Option = {
    label: string;
    value: string;
};

type FormFieldProps = {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => void;
    placeholder?: string;
    as?: "input" | "textarea" | "select";
    options?: Option[];
};

const FormField = ({
                       id,
                       label,
                       type = "text",
                       value,
                       onChange,
                       placeholder,
                       as = "input",
                       options = [],
                   }: FormFieldProps) => {
    return (
        <div className="form-field">
            <label htmlFor={id} className="form-label">
                {label}
            </label>
            {as === "textarea" ? (
                <textarea
                    id={id}
                    name={id}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="form-textarea"
                />
            ) : as === "select" ? (
                <select
                    id={id}
                    name={id}
                    value={value}
                    onChange={onChange}
                    className="form-select"
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    id={id}
                    name={id}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="form-input"
                />
            )}
        </div>
    );
};

export default FormField;