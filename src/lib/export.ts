import * as XLSX from 'xlsx';
import { format, parseISO } from 'date-fns';
import { Seminar } from '../data';

export function exportMultiSheetExcel(data: Seminar[]) {
  const wb = XLSX.utils.book_new();

  // --- Sheet 1: Raw Data ---
  const wsRaw = XLSX.utils.json_to_sheet(data.map(d => ({
    Provider: d.provider,
    'Seminar Title': d.seminar_title,
    Category: d.category,
    'Sub Topic': d.sub_topic,
    Date: format(parseISO(d.termin), 'yyyy-MM-dd'),
    Duration: d.duration,
    Format: d.format,
    'Live Chat': d.has_live_chat ? 'Yes' : 'No',
    Price: d.price ? `€${d.price}` : 'N/A',
    Frequency: d.frequency,
    Language: d.language,
    Certification: d.certification ? 'Yes' : 'No',
    URL: d.url
  })));
  XLSX.utils.book_append_sheet(wb, wsRaw, "Raw Data");

  // --- Sheet 2: By Category ---
  const categories = Array.from(new Set(data.map(d => d.category)));
  const providers = Array.from(new Set(data.map(d => d.provider)));
  const categoryData = providers.map(provider => {
    const row: any = { Provider: provider };
    let total = 0;
    categories.forEach(cat => {
      const count = data.filter(d => d.provider === provider && d.category === cat).length;
      row[cat] = count;
      total += count;
    });
    row.Total = total;
    return row;
  }).sort((a, b) => b.Total - a.Total);
  
  const wsCategory = XLSX.utils.json_to_sheet(categoryData);
  XLSX.utils.book_append_sheet(wb, wsCategory, "By Category");

  // --- Sheet 3: By Termin ---
  const terminData = [...data]
    .sort((a, b) => new Date(a.termin).getTime() - new Date(b.termin).getTime())
    .map(d => ({
      Month: format(parseISO(d.termin), 'MMMM yyyy'),
      Date: format(parseISO(d.termin), 'dd MMM yyyy'),
      Provider: d.provider,
      Title: d.seminar_title,
      Format: d.format
    }));
  const wsTermin = XLSX.utils.json_to_sheet(terminData);
  XLSX.utils.book_append_sheet(wb, wsTermin, "By Termin");

  // --- Sheet 4: Format Overview ---
  const formatData = providers.map(provider => {
    const pData = data.filter(d => d.provider === provider);
    return {
      Provider: provider,
      Online: pData.filter(d => d.format === 'Online').length,
      Präsenz: pData.filter(d => d.format === 'Präsenz').length,
      Hybrid: pData.filter(d => d.format === 'Hybrid').length,
      'Has Live Chat': pData.filter(d => d.has_live_chat).length,
      'No Live Chat': pData.filter(d => !d.has_live_chat).length
    }
  });
  const wsFormat = XLSX.utils.json_to_sheet(formatData);
  XLSX.utils.book_append_sheet(wb, wsFormat, "Online vs Präsenz");

  // --- Sheet 5: Frequency ---
  const counts: Record<string, any> = {};
  data.forEach(d => {
    const key = `${d.seminar_title}|${d.provider}|${d.category}`;
    if (!counts[key]) counts[key] = { Title: d.seminar_title, Provider: d.provider, Category: d.category, Count: 0 };
    counts[key].Count++;
  });
  const freqData = Object.values(counts).sort((a: any, b: any) => b.Count - a.Count);
  const wsFreq = XLSX.utils.json_to_sheet(freqData);
  XLSX.utils.book_append_sheet(wb, wsFreq, "Frequency");

  // Download Output
  XLSX.writeFile(wb, "Seminar_Market_Research.xlsx");
}
