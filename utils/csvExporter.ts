/**
 * Converts an array of objects to a CSV string.
 * @param data The array of objects to convert.
 * @returns The CSV formatted string.
 */
const convertToCSV = (data: any[]): string => {
    if (data.length === 0) {
        return '';
    }
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => 
        headers.map(header => {
            let value = obj[header];
            if (value === null || value === undefined) {
                return '';
            }
            // Escape quotes by doubling them and wrap the whole value in quotes if it contains a comma or a quote.
            let strValue = String(value);
            if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
                strValue = `"${strValue.replace(/"/g, '""')}"`;
            }
            return strValue;
        }).join(',')
    );
    return [headers.join(','), ...rows].join('\r\n');
};

/**
 * Triggers a browser download for a CSV file.
 * @param filename The desired filename for the downloaded file (without extension).
 * @param data The array of objects to export.
 */
export const exportToCsv = (filename: string, data: any[]): void => {
    if (data.length === 0) {
        console.warn("No data provided to export.");
        return;
    }
    const csvString = convertToCSV(data);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};
