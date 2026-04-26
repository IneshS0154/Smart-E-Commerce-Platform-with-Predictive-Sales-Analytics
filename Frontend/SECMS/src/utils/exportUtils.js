/**
 * Utility to export an array of objects to a CSV file.
 * @param {Array} data - Array of objects to export.
 * @param {string} fileName - Name of the file to be saved (without extension).
 * @param {Array} headers - Optional array of strings for CSV headers. If not provided, keys of the first object are used.
 */
export const exportToCSV = (data, fileName) => {
    if (!data || data.length === 0) {
        alert("No data available to export");
        return;
    }

    // Get headers from first object keys
    const headers = Object.keys(data[0]);
    
    // Create CSV rows
    const csvRows = [];
    
    // Add headers row
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header];
            // Escape double quotes and wrap in double quotes if contains comma
            const stringVal = (val === null || val === undefined) ? "" : String(val);
            const escaped = stringVal.replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    // Create a Blob from the CSV string
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    
    // Trigger download
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${fileName}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
