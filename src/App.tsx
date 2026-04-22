import { useState, useMemo } from 'react';
import { INITIAL_DATA, Seminar } from './data';
import { exportMultiSheetExcel } from './lib/export';
import { 
  Database, LayoutDashboard, BarChart3, CalendarDays, 
  MapPin, Activity, Download, Search, Filter, 
  ChevronRight, RefreshCcw, Server
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { cn } from './lib/utils';

type ViewType = 'overview' | 'raw' | 'category' | 'termin' | 'format' | 'frequency';

const COLORS = ['#141414', '#555555', '#888888', '#AAAAAA', '#CCCCCC'];

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<Seminar[]>(INITIAL_DATA);

  // Filtered data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lower = searchTerm.toLowerCase();
    return data.filter(s => 
      s.seminar_title.toLowerCase().includes(lower) || 
      s.provider.toLowerCase().includes(lower) ||
      s.category.toLowerCase().includes(lower)
    );
  }, [data, searchTerm]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--color-bg)] text-[var(--color-ink)] selection:bg-[var(--color-ink)] selection:text-[var(--color-bg)]">
      
      {/* SIDEBAR */}
      <aside className="w-64 flex flex-col border-r border-[var(--color-ink)] shrink-0 bg-[var(--color-bg)] z-10">
        <div className="p-6 border-b border-[var(--color-ink)] bg-black text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="relative z-10 flex items-center gap-3">
            <Server className="w-6 h-6" />
            <h1 className="font-serif italic font-bold tracking-tight text-xl leading-tight">
              MARKET<br/>SCRAPER<span className="text-[#FF4A00]">.</span>
            </h1>
          </div>
          <p className="relative z-10 font-mono text-[10px] mt-4 opacity-60 uppercase tracking-widest text-[#FF4A00]">
            Nextise GmbH // 14 Providers
          </p>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          <p className="font-mono text-[10px] uppercase tracking-widest opacity-50 mb-2 mt-4 px-2">Views</p>
          <NavItem icon={LayoutDashboard} label="Overview" active={activeView === 'overview'} onClick={() => setActiveView('overview')} />
          <NavItem icon={Database} label="Sheet 1: Raw Data" active={activeView === 'raw'} onClick={() => setActiveView('raw')} />
          <NavItem icon={BarChart3} label="Sheet 2: By Category" active={activeView === 'category'} onClick={() => setActiveView('category')} />
          <NavItem icon={CalendarDays} label="Sheet 3: By Termin" active={activeView === 'termin'} onClick={() => setActiveView('termin')} />
          <NavItem icon={MapPin} label="Sheet 4: Online vs Präsenz" active={activeView === 'format'} onClick={() => setActiveView('format')} />
          <NavItem icon={Activity} label="Sheet 5: Frequency" active={activeView === 'frequency'} onClick={() => setActiveView('frequency')} />
        </nav>

        <div className="p-4 border-t border-[var(--color-ink)]">
          <div className="bg-[var(--color-ink)] text-[var(--color-bg)] p-3 rounded flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] uppercase">Record Count</span>
              <span className="font-mono text-sm">{filteredData.length}</span>
            </div>
            <button 
              onClick={() => exportMultiSheetExcel(filteredData)}
              className="w-full py-1.5 px-3 bg-[var(--color-bg)] text-[var(--color-ink)] font-sans text-xs font-semibold hover:bg-white transition-colors flex justify-center items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export .xlsx
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* HEADER */}
        <header className="h-16 flex-shrink-0 border-b border-[var(--color-ink)] flex items-center justify-between px-6 bg-[var(--color-bg)] relative">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="font-serif italic text-lg opacity-80 uppercase tracking-wide">
              {activeView.replace('-', ' ')} View
            </h2>
          </div>
          
          <div className="flex items-center border border-[var(--color-ink)] bg-white px-3 py-1.5 w-64 focus-within:ring-1 ring-[var(--color-ink)] transition-all">
            <Search className="w-4 h-4 opacity-50 mr-2" />
            <input 
              type="text" 
              placeholder="Filter exact matching..." 
              className="bg-transparent border-none outline-none text-sm font-mono w-full placeholder:opacity-50"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="ml-4 flex items-center gap-2 font-mono text-xs opacity-60">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            PIPELINE IDLE
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-auto bg-[#D8D6D2] p-6 relative select-text">
          <div className="max-w-[1400px] mx-auto h-full flex flex-col">
            {activeView === 'overview' && <OverviewView data={filteredData} />}
            {activeView === 'raw' && <RawDataView data={filteredData} />}
            {activeView === 'category' && <CategoryView data={filteredData} />}
            {activeView === 'termin' && <TerminView data={filteredData} />}
            {activeView === 'format' && <FormatView data={filteredData} />}
            {activeView === 'frequency' && <FrequencyView data={filteredData} />}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- COMPONENTS & VIEWS ---

function NavItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 text-sm font-sans font-medium transition-all rounded-sm border-l-2",
        active 
          ? "border-[var(--color-ink)] bg-[rgba(20,20,20,0.05)] text-[var(--color-ink)]" 
          : "border-transparent opacity-60 hover:opacity-100 hover:bg-[rgba(20,20,20,0.03)]"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
      {active && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
    </button>
  );
}

// 1. OVERVIEW VIEW (Dashboard)
function OverviewView({ data }: { data: Seminar[] }) {
  const avgPrice = data.filter(d => d.price).reduce((acc, curr) => acc + curr.price!, 0) / data.filter(d => d.price).length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full content-start">
      <MetricCard title="Total Scraped Seminars" value={data.length} subtitle="Across 14 providers" />
      <MetricCard title="Avg Public Price" value={`€${avgPrice.toFixed(2)}`} subtitle="For seminars with listed pricing" />
      <MetricCard title="Earliest Termin" value={data[0]?.termin ? format(parseISO(data[0].termin), 'dd MMM yyyy') : 'N/A'} subtitle="Currently available" />
      
      <div className="col-span-1 md:col-span-3 panel-border bg-white p-6">
        <h3 className="col-header mb-6">Provider Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getProviderStats(data)}>
              <XAxis dataKey="name" tick={{fontFamily: 'Courier New', fontSize: 11}} interval={0} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{fontFamily: 'Courier New', fontSize: 11}} />
              <Tooltip cursor={{fill: '#f0f0f0'}} contentStyle={{fontFamily: 'Courier New', fontSize: 12}} />
              <Bar dataKey="value" fill="var(--color-ink)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle }: { title: string, value: string | number, subtitle: string }) {
  return (
    <div className="panel-border bg-white p-5 flex flex-col gap-2">
      <h3 className="col-header">{title}</h3>
      <p className="font-mono text-3xl font-bold tracking-tighter">{value}</p>
      <p className="font-sans text-xs opacity-50">{subtitle}</p>
    </div>
  );
}

function getProviderStats(data: Seminar[]) {
  const counts: Record<string, number> = {};
  data.forEach(d => counts[d.provider] = (counts[d.provider] || 0) + 1);
  return Object.entries(counts).map(([name, value]) => ({name, value})).sort((a, b) => b.value - a.value);
}

// 2. RAW DATA VIEW (Sheet 1)
function RawDataView({ data }: { data: Seminar[] }) {
  return (
    <div className="panel-border bg-white flex flex-col h-full overflow-hidden">
      <div className="grid grid-cols-[100px_1fr_1fr_120px_100px_80px_60px] gap-4 p-4 border-b border-[var(--color-ink)] bg-[#f5f5f5] sticky top-0">
        <div className="col-header">Provider</div>
        <div className="col-header">Seminar Title</div>
        <div className="col-header">Category</div>
        <div className="col-header">Termin</div>
        <div className="col-header">Format</div>
        <div className="col-header text-right">Price</div>
        <div className="col-header text-center">Chat</div>
      </div>
      <div className="flex-1 overflow-auto">
        {data.slice(0, 100).map((row, i) => ( // only top 100 for perf in preview
          <div key={row.id} className="grid grid-cols-[100px_1fr_1fr_120px_100px_80px_60px] gap-4 p-4 border-b border-[#e0e0e0] hover:bg-[var(--color-ink)] hover:text-white transition-colors group">
            <div className="font-sans text-sm font-semibold truncate group-hover:text-white" title={row.provider}>{row.provider}</div>
            <div className="font-sans text-sm truncate group-hover:text-white" title={row.seminar_title}>{row.seminar_title}</div>
            <div className="font-mono text-xs opacity-70 truncate group-hover:opacity-90">{row.category} &gt; {row.sub_topic}</div>
            <div className="font-mono text-xs group-hover:text-white">{format(parseISO(row.termin), 'MMM dd, yyyy')}</div>
            <div className="font-mono text-xs group-hover:text-white">{row.format} {row.language === 'English' && "(EN)"}</div>
            <div className="font-mono text-xs text-right group-hover:text-white">{row.price ? `€${row.price}` : '---'}</div>
            <div className="font-mono text-xs text-center group-hover:text-white">{row.has_live_chat ? 'Y' : 'N'}</div>
          </div>
        ))}
        {data.length > 100 && (
          <div className="p-4 text-center font-mono text-xs opacity-50 bg-[#f5f5f5]">
            ... showing top 100 of {data.length} records in Data Grid. Complete set available in Excel Export.
          </div>
        )}
      </div>
    </div>
  );
}

// 3. CATEGORY VIEW (Sheet 2)
function CategoryView({ data }: { data: Seminar[] }) {
  const categoryStats = useMemo(() => {
    const categories = Array.from(new Set(data.map(d => d.category)));
    const providers = Array.from(new Set(data.map(d => d.provider)));
    
    return providers.map(provider => {
      const pData: any = { provider };
      categories.forEach(cat => {
        pData[cat] = data.filter(d => d.provider === provider && d.category === cat).length;
      });
      return pData;
    });
  }, [data]);

  const categories = Array.from(new Set(data.map(d => d.category)));

  return (
    <div className="panel-border bg-white flex flex-col h-full overflow-hidden p-6">
      <h3 className="col-header mb-6">Seminars per Topic per Provider</h3>
      <div className="flex-1 overflow-auto border border-[#e0e0e0]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="p-3 border-b border-[#e0e0e0] border-r col-header w-48">Provider</th>
              {categories.map(cat => (
                <th key={cat} className="p-3 border-b border-[#e0e0e0] border-r col-header text-center">{cat}</th>
              ))}
              <th className="p-3 border-b border-[#e0e0e0] col-header text-center bg-[#eaeaea]">Total</th>
            </tr>
          </thead>
          <tbody>
            {categoryStats.sort((a,b) => {
              const aTot = categories.reduce((acc, cat) => acc + (a[cat] || 0), 0);
              const bTot = categories.reduce((acc, cat) => acc + (b[cat] || 0), 0);
              return bTot - aTot; // Sort by total
            }).map((row, i) => {
              const total = categories.reduce((acc, cat) => acc + (row[cat] || 0), 0);
              return (
                <tr key={i} className="hover:bg-black hover:text-white transition-colors group">
                  <td className="p-3 border-b border-[#e0e0e0] border-r font-sans font-semibold text-sm group-hover:border-[#333]">{row.provider}</td>
                  {categories.map(cat => (
                    <td key={cat} className="p-3 border-b border-[#e0e0e0] border-r font-mono text-center text-sm group-hover:border-[#333]">
                      {row[cat] || '-'}
                    </td>
                  ))}
                  <td className="p-3 border-b border-[#e0e0e0] font-mono text-center font-bold text-sm bg-black/5 group-hover:bg-white/10 group-hover:border-[#333]">{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 4. TERMIN VIEW (Sheet 3)
function TerminView({ data }: { data: Seminar[] }) {
  const groupedDates = useMemo(() => {
    const grouped: Record<string, Seminar[]> = {};
    const sorted = [...data].sort((a,b) => new Date(a.termin).getTime() - new Date(b.termin).getTime());
    
    sorted.forEach(s => {
      const monthYear = format(parseISO(s.termin), 'MMMM yyyy');
      if (!grouped[monthYear]) grouped[monthYear] = [];
      grouped[monthYear].push(s);
    });
    return grouped;
  }, [data]);

  return (
    <div className="h-full overflow-y-auto pr-4">
      <div className="flex flex-col gap-8">
        {(Object.entries(groupedDates) as [string, Seminar[]][]).map(([month, seminars]) => (
          <div key={month} className="panel-border bg-white p-6 relative">
            <h3 className="font-serif text-3xl font-bold italic absolute -top-5 left-4 bg-[#D8D6D2] px-2">{month}</h3>
            <div className="font-mono text-xs mb-4 mt-2 opacity-50 uppercase tracking-widest">{seminars.length} Seminars scheduled</div>
            
            <div className="grid grid-cols-[100px_1fr_150px_100px] gap-2 border-b border-black pb-2 mb-2">
              <div className="col-header">Date</div>
              <div className="col-header">Seminar</div>
              <div className="col-header">Provider</div>
              <div className="col-header">Format</div>
            </div>

            <div className="flex flex-col">
              {seminars.map((s, i) => (
                <div key={i} className="grid grid-cols-[100px_1fr_150px_100px] gap-2 py-2 border-b border-[#f0f0f0] hover:bg-[#f9f9f9]">
                  <div className="font-mono text-sm">{format(parseISO(s.termin), 'dd MMM')}</div>
                  <div className="font-sans text-sm">{s.seminar_title}</div>
                  <div className="font-mono text-xs opacity-70">{s.provider}</div>
                  <div className="font-mono text-xs uppercase tracking-wider">
                    {s.format === 'Online' ? '🟢' : s.format === 'Präsenz' ? '🏢' : '🔄'} {s.format}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 5. FORMAT VIEW (Sheet 4)
function FormatView({ data }: { data: Seminar[] }) {
  const stats = useMemo(() => {
    let online = 0, presenz = 0, hybrid = 0;
    let withChat = 0, noChat = 0;
    
    data.forEach(d => {
      if (d.format === 'Online') online++;
      else if (d.format === 'Präsenz') presenz++;
      else hybrid++;

      if (d.has_live_chat) withChat++;
      else noChat++;
    });

    return {
      format: [
        { name: 'Online', value: online },
        { name: 'Präsenz', value: presenz },
        { name: 'Hybrid', value: hybrid },
      ],
      chat: [
        { name: 'Has Live Chat', value: withChat },
        { name: 'No Chat Provided', value: noChat },
      ]
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full content-start">
      <div className="panel-border bg-white p-6 flex flex-col">
        <h3 className="col-header mb-6">Format Distribution</h3>
        <div className="h-[300px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={stats.format} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={2} dataKey="value" stroke="var(--color-bg)" strokeWidth={2}>
                {stats.format.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{fontFamily: 'Courier New', fontSize: 12, borderRadius: 0, border: '1px solid black'}} />
              <Legend verticalAlign="bottom" height={36} formatter={(val) => <span className="font-mono text-xs tracking-wider uppercase ml-1 opacity-80">{val}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel-border bg-white p-6 flex flex-col">
        <h3 className="col-header mb-6">Live Chat Availability (Online/Hybrid)</h3>
        <div className="h-[300px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={stats.chat} cx="50%" cy="50%" innerRadius={0} outerRadius={120} paddingAngle={1} dataKey="value" stroke="white" strokeWidth={1}>
                <Cell fill="#141414" />
                <Cell fill="#cccccc" />
              </Pie>
              <Tooltip contentStyle={{fontFamily: 'Courier New', fontSize: 12, borderRadius: 0, border: '1px solid black'}} />
              <Legend verticalAlign="bottom" height={36} formatter={(val) => <span className="font-mono text-xs tracking-wider uppercase ml-1 opacity-80">{val}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Break down per provider */}
      <div className="col-span-1 md:col-span-2 panel-border bg-white p-6">
        <h3 className="col-header mb-4">Breakdown by Provider</h3>
        <div className="grid grid-cols-[150px_1fr_1fr_1fr] gap-4 py-2 border-b border-black">
          <div className="font-mono text-xs font-bold uppercase">Provider</div>
          <div className="font-mono text-xs font-bold uppercase text-center">Online</div>
          <div className="font-mono text-xs font-bold uppercase text-center">Präsenz</div>
          <div className="font-mono text-xs font-bold uppercase text-center">Hybrid</div>
        </div>
        {getProviderStats(data).map(({name}) => {
          const pData = data.filter(d => d.provider === name);
          const o = pData.filter(d => d.format === 'Online').length;
          const p = pData.filter(d => d.format === 'Präsenz').length;
          const h = pData.filter(d => d.format === 'Hybrid').length;
          const max = Math.max(o, p, h);
          return (
            <div key={name} className="grid grid-cols-[150px_1fr_1fr_1fr] gap-4 py-3 border-b border-[#f0f0f0]">
              <div className="font-sans font-semibold text-sm">{name}</div>
              <div className="font-mono text-sm text-center flex items-center justify-center gap-2">
                {o} {o === max && o > 0 && <span className="w-2 h-2 rounded-full bg-black"></span>}
              </div>
              <div className="font-mono text-sm text-center flex items-center justify-center gap-2">
                {p} {p === max && p > 0 && <span className="w-2 h-2 rounded-full bg-black"></span>}
              </div>
              <div className="font-mono text-sm text-center flex items-center justify-center gap-2">
                {h} {h === max && h > 0 && <span className="w-2 h-2 rounded-full bg-black"></span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

// 6. FREQUENCY VIEW (Sheet 5)
function FrequencyView({ data }: { data: Seminar[] }) {
  const frequentSeminars = useMemo(() => {
    const counts: Record<string, { count: number, provider: string, category: string }> = {};
    data.forEach(d => {
      const key = `${d.seminar_title}|${d.provider}|${d.category}`;
      if (!counts[key]) counts[key] = { count: 0, provider: d.provider, category: d.category };
      counts[key].count++;
    });
    return Object.entries(counts)
      .map(([key, val]) => ({ title: key.split('|')[0], ...val }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50); // Top 50
  }, [data]);

  return (
    <div className="panel-border bg-white flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-black">
        <h3 className="col-header mb-1">Top Offerings</h3>
        <p className="font-mono text-xs opacity-60">Seminars offered most frequently across all dates scraped.</p>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-[50px_1fr_150px_150px_100px] gap-4 pb-2 border-b border-black sticky top-0 bg-white z-10 pt-2">
          <div className="col-header">Rank</div>
          <div className="col-header">Seminar Title</div>
          <div className="col-header">Provider</div>
          <div className="col-header">Category</div>
          <div className="col-header text-center">Freq Count</div>
        </div>
        
        {frequentSeminars.map((sem, i) => (
          <div key={i} className="grid grid-cols-[50px_1fr_150px_150px_100px] gap-4 py-4 border-b border-[#f0f0f0] group hover:bg-[#f9f9f9]">
            <div className="font-serif italic font-bold text-xl opacity-30 group-hover:opacity-100 transition-opacity">
              {(i+1).toString().padStart(2, '0')}
            </div>
            <div className="font-sans font-semibold text-sm self-center">
              {sem.title}
            </div>
            <div className="font-mono text-xs opacity-70 self-center uppercase tracking-wider">
              {sem.provider}
            </div>
            <div className="font-mono text-xs opacity-70 self-center">
              {sem.category}
            </div>
            <div className="flex items-center justify-center">
              <span className="font-mono text-sm bg-black text-white px-3 py-1 rounded-sm">
                {sem.count}x
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

