import React from "react";
import "./FilterBar.css";

interface FilterBarProps {
  categories: string[];
  selectedCategory: string;
  sortBy: string;
  onCategoryChange: (category: string) => void;
  onSortChange: (sortValue: string) => void;
  onApply: () => void; // THÊM MỚI: Prop cho hành động nhấn nút
}

const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategory,
  sortBy,
  onCategoryChange,
  onSortChange,
  onApply, // THÊM MỚI
}) => {
  return (
    <div className="filter-bar">
      <div className="filter-section">
        <label className="filter-label">Danh mục:</label>
        <div className="category-buttons">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <label htmlFor="sort-select" className="filter-label">
          Sắp xếp theo:
        </label>
        <select
          id="sort-select"
          className="sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="distance">Gần nhất</option>
          <option value="rating_desc">Đánh giá cao nhất</option>
          <option value="price_asc">Giá thấp đến cao</option>
          <option value="price_desc">Giá cao đến thấp</option>
        </select>
      </div>

      {/* THÊM MỚI: Đưa nút "Áp dụng" vào đây */}
      <div className="filter-apply-section">
        <button className="apply-filter-btn" onClick={onApply}>
          Áp dụng bộ lọc
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
