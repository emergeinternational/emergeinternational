
import React from "react";
import { useNavigate } from "react-router-dom";

// Define talent types directly in the component
const TALENT_TYPES = [
  { id: "model", name: "Model" },
  { id: "designer", name: "Designer" },
  { id: "photographer", name: "Photographer" },
  { id: "business", name: "Business" }
];

export interface TalentCategoryFilterProps {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

const TalentCategoryFilter = ({ activeFilter, onFilterChange }: TalentCategoryFilterProps) => {
  const navigate = useNavigate();

  const handleCategoryClick = (id: string) => {
    if (onFilterChange) {
      onFilterChange(id);
    } else {
      navigate(`/education?talent=${id}`);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-4 mb-6">
      <button
        onClick={() => handleCategoryClick("all")}
        className={`px-4 py-2 rounded-full text-sm ${
          activeFilter === "all" || !activeFilter
            ? "bg-emerge-gold text-white"
            : "bg-gray-100 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      
      {TALENT_TYPES.map((type) => (
        <button
          key={type.id}
          onClick={() => handleCategoryClick(type.id)}
          className={`px-4 py-2 rounded-full text-sm ${
            activeFilter === type.id
              ? "bg-emerge-gold text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {type.name}
        </button>
      ))}
    </div>
  );
};

export default TalentCategoryFilter;
