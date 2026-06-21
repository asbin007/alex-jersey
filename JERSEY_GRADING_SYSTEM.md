# Jersey Grading System

## Overview
The Alex Jersey Shop now implements a comprehensive grading system for all football jerseys. This system helps customers understand the quality and condition of the products they are purchasing.

## Grades

### A Grade - Premium Quality
- **Description**: Perfect condition jerseys with no defects
- **Characteristics**:
  - No manufacturing defects
  - Perfect stitching and material quality
  - Official team authentic designs
  - Full tags and labels intact
  - Retail packaging included (if applicable)
- **Price**: Full price
- **Target**: Customers seeking premium, perfect condition jerseys

### B Grade - Slight Defects/Irregularities
- **Description**: Jerseys with minor cosmetic defects
- **Characteristics**:
  - Minor cosmetic imperfections (small stains, scuffs, etc.)
  - No functional issues
  - Authentic team designs (may have production variations)
  - Slight irregularities in printing or material
  - May not include original packaging
- **Price**: 20-30% discount from A grade
- **Target**: Budget-conscious customers who don't mind minor cosmetic issues

## How to Use in Admin Panel

1. **Creating/Editing Products**:
   - Select the appropriate grade (A, B, or No Grade)
   - Add grade description explaining specific characteristics (if needed)
   - B grade products should automatically have a lower price

2. **Customer Display**:
   - Grade badges appear on product cards
   - A grade: Green badge with "A Grade"
   - B grade: Orange badge with "B Grade"
   - Hover tooltips show grade details

3. **Filtering**:
   - Customers can filter by grade in the products page
   - Filters include: All Grades, A Grade, B Grade

## Benefits

1. **Transparency**: Clear communication about product quality
2. **Value Options**: Multiple price points for different budgets
3. **Inventory Management**: Easy identification of graded products
4. **Customer Confidence**: Clear expectations about product condition

## Implementation Notes

- Grade is optional - products without a grade are displayed normally
- B grade products should be priced accordingly (typically 20-30% less than A grade)
- Grade description can provide specific details about defects for B grade items
- The system is designed to work seamlessly with existing product management