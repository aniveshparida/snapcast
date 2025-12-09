'use client'
import React, { useState } from 'react'

type DropdownListProps = {
  options: string[];
  selectedOption: string;
  onOptionSelect: (option: string) => void;
  triggerElement: React.ReactNode;
}

const DropdownList = ({
  options,
  selectedOption,
  onOptionSelect,
  triggerElement,
}: DropdownListProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <div className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        {triggerElement}
      </div>
      {isOpen && (
        <ul className="dropdown">
          {options.map((option) => (
            <li
              key={option}
              className={`list-item ${option === selectedOption ? 'active' : ''}`}
              onClick={() => {
                onOptionSelect(option)
                setIsOpen(false)
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default DropdownList
