# TelOSINT

TelOSINT is a robust program designed to automatically detect and gather comprehensive information about every phone number found in .pdf or .txt files. It further enhances its utility by saving Google search results related to each phone number, offering a unique approach to telecommunication data analysis.

<p align="center">
  <img src="https://github.com/user-attachments/assets/faf7cddf-0519-4271-82c4-d4416c49ef10" width="50%" height="50%" />
</p> 

## Instructions

1. Start by double-clicking on the `Create_shortcuts_for_TelOsint.exe` program. This will create the necessary shortcuts in the `TelOsint shortcuts` folder.
2. To run TelOSINT, double-click on the `telosint.exe` file located in the `TelOsint shortcuts` folder.

## Usage

- **Extract Phone Numbers and Their Info:**
  - Click on the first button to select a .pdf or .txt file. The program will extract information for every phone number found in the file.
  - Extracted phone numbers and their details will be added to the `phoneinfo_telosint.csv` file, which you can find in the `TelOsint shortcuts` folder. This file is compatible with Excel or LibreOffice for easy viewing.
  - Additionally, a map will be created in the `maps` folder (accessible via the shortcut in the `TelOsint shortcuts` folder) to visually represent the location data of extracted numbers.

- **Save Google Search Information:**
  - Before using the second button, you must enter the phone number in INTERNATIONAL FORMAT (e.g., +351234567890) and specify the number of URLs you wish to save from Google search results, in descending order.
  - Upon successful completion, URLs for each phone number will be stored in the corresponding Excel file within the `num_google_search` folder located in the `TelOsint shortcuts`.

## Tips

- If you already have phone numbers in an Excel/CSV file, simply copy the column into a .txt file and use the program's first function to process it. The same applies if you wish to analyze specific numbers; just type them into a .txt file.
- Utilize the information from the generated maps to further explore related data on Google Maps.
- Should the second function of the program fail, it may be due to an excessive number of HTTP requests to Google, resulting in a temporary block. In such cases, it is advisable to wait before attempting another search (typically, a one-hour wait is sufficient).

Apologizing for any issue.
