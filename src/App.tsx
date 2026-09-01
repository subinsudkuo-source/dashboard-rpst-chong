"use client";

import {
  AlertTriangle, Ban, Box, CalendarClock, ChartNoAxesCombined, CheckCircle2,
  ClipboardList, Clock3, Coins, HandCoins, Pill, RefreshCw, ShoppingCart,
  Stethoscope, Users, WalletCards
} from "lucide-react";
import {
  Area, Bar, Cell, ComposedChart, CartesianGrid, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import data from "./dashboard-data.json";

const nf = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 });
const baht = (value: number) => `${nf.format(value)} บาท`;
type Drug = (typeof data.topUsage)[number] & { days?: number | null; expiry?: string };

const statusCards = [
  { label: "หมดสต็อก", value: data.summary.outStock, color: "red", icon: Ban },
  { label: "ต่ำกว่าเกณฑ์", value: data.summary.belowThreshold, color: "orange", icon: HandCoins },
  { label: "ใกล้หมดอายุ ≤ 90 วัน", value: data.summary.nearExpiry, color: "amber", icon: AlertTriangle },
  { label: "คงเหลือไม่ถึง 1 เดือน", value: data.summary.lowCover, color: "blue", icon: Clock3 },
];
const stockPie = [
  { name: "ปกติ", value: data.summary.items - data.summary.outStock - data.summary.belowThreshold, color: "#31a866" },
  { name: "ต่ำกว่าเกณฑ์", value: data.summary.belowThreshold, color: "#ff7a19" },
  { name: "หมดสต็อก", value: data.summary.outStock, color: "#e52231" },
];

function Panel({ title, tone = "blue", children, className = "" }: { title: string; tone?: "blue" | "green" | "red" | "teal"; children: React.ReactNode; className?: string }) {
  return <section className={`panel ${className}`}><h2 className={`panel-title ${tone}`}>{title}</h2><div className="panel-body">{children}</div></section>;
}
function Metric({ icon: Icon, label, value, unit, tone }: { icon: React.ElementType; label: string; value: string; unit: string; tone: string }) {
  return <article className={`metric ${tone}`}><div className="metric-label">{label}</div><div className="metric-main"><Icon size={36}/><strong>{value}</strong></div><div className="metric-unit">{unit}</div></article>;
}
function RankedBars({ rows, field, color }: { rows: Drug[]; field: "usageQty" | "qty"; color: string }) {
  const max = Math.max(...rows.map(r => Number(r[field])), 1);
  return <div className="rank-list">{rows.slice(0, 10).map((r, i) => <div className="rank-row" key={r.name}>
    <span className="rank-no">{i + 1}</span><span className="drug-name" title={r.name}>{r.name}</span>
    <span className="bar-track"><i style={{ width: `${Math.max((Number(r[field]) / max) * 100, 2)}%`, background: color }}/></span>
    <b>{nf.format(Number(r[field]))}</b>
  </div>)}</div>;
}
function Donut({ rows, center, children }: { rows: { name: string; value: number; color: string }[]; center: React.ReactNode; children: React.ReactNode }) {
  return <div className="donut-wrap"><div className="donut-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={rows} dataKey="value" innerRadius="55%" outerRadius="83%" paddingAngle={1}>{rows.map(r => <Cell key={r.name} fill={r.color}/>)}</Pie></PieChart></ResponsiveContainer><div className="donut-center">{center}</div></div><div className="donut-legend">{children}</div></div>;
}

export default function Home() {
  return <main className="dashboard-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><Pill size={46}/><i/></div><div><h1>Dashboard ระบบคลังยา</h1><p>โรงพยาบาลส่งเสริมสุขภาพตำบลช่อง จังหวัดตรัง</p><span>ระบบบริหารคลังยา (StockDrugPcu)</span></div></div>
      <div className="process" aria-label="กระบวนการคลังยา">
        {[{n:"จัดซื้อ",I:ShoppingCart,c:"green"},{n:"เบิก",I:ClipboardList,c:"blue"},{n:"จ่าย",I:HandCoins,c:"orange"},{n:"ใช้",I:Users,c:"purple"},{n:"คงเหลือ",I:Box,c:"teal"},{n:"หมดอายุ",I:CalendarClock,c:"red"}].map(({n,I,c},i)=><div className="process-step" key={n}><div className={`process-icon ${c}`}><I/><b>{n}</b></div>{i<5&&<span>→</span>}</div>)}
      </div>
      <div className="asof"><CalendarClock size={21}/> ข้อมูล ณ วันที่ {data.asOf}<small><RefreshCw size={12}/> ประมวลผลทุกวัน 10.00 น.</small></div>
    </header>

    <div className="overview-label">ภาพรวม</div>
    <div className="hero-grid">
      <section className="metrics-grid">
        <Metric icon={Pill} label="รายการยา" value={nf.format(data.summary.items)} unit="รายการ" tone="green"/>
        <Metric icon={Box} label="คงเหลือ" value={nf.format(data.summary.inventoryQty)} unit="หน่วย" tone="mint"/>
        <Metric icon={Coins} label="มูลค่าคงเหลือ" value={nf.format(data.summary.inventoryValue)} unit="บาท" tone="emerald"/>
        <Metric icon={ClipboardList} label="เบิกสะสม" value={nf.format(data.summary.dispenseQty)} unit={`หน่วย • ${nf.format(data.summary.dispenseValue)} บาท`} tone="blue"/>
        <Metric icon={Users} label="ใช้สะสม" value={nf.format(data.summary.totalUsageQty)} unit={`หน่วย • ${nf.format(data.summary.totalUsageValue)} บาท`} tone="purple"/>
      </section>
      <Panel title="สถานะเฝ้าระวัง" tone="red" className="watch-panel"><div className="status-grid">{statusCards.map(({label,value,color,icon:Icon})=><article className={`status-card ${color}`} key={label}><Icon/><span>{label}</span><strong>{nf.format(value)}</strong><small>รายการ</small></article>)}</div></Panel>
    </div>

    <div className="main-grid">
      <Panel title="10 อันดับยาที่ใช้มากที่สุด"><p className="subtitle">จัดอันดับตามปริมาณการใช้สะสม</p><RankedBars rows={data.topUsage} field="usageQty" color="#0863c4"/><p className="axis-note">หน่วย: จำนวนหน่วยยา</p></Panel>
      <Panel title="10 อันดับยาคงเหลือมากที่สุด" tone="green"><p className="subtitle">จัดอันดับตามจำนวนคงเหลือปัจจุบัน</p><RankedBars rows={data.topStock} field="qty" color="#43ad49"/><p className="axis-note">หน่วย: จำนวนหน่วยยา</p></Panel>
      <Panel title="10 อันดับยาใกล้หมดอายุที่สุด" tone="red"><p className="subtitle redtext">อ้างอิงวันที่ {data.asOf}</p><div className="expiry-list">{data.expiring.length ? data.expiring.map((r,i)=><div className="expiry-row" key={r.name}><b>{i+1}</b><span title={r.name}>{r.name}</span><em>{r.days} วัน</em></div>) : <div className="empty"><CheckCircle2/> ไม่มียาใกล้หมดอายุใน 90 วัน</div>}</div><p className="axis-note">หมายเหตุ: แสดงเฉพาะรายการที่มีคงเหลือ</p></Panel>
      <div className="side-charts">
        <Panel title="มูลค่าการใช้ยาเทียบกับมูลค่าคงเหลือ"><Donut rows={[{name:"มูลค่าใช้สะสม",value:data.summary.totalUsageValue,color:"#8f48b8"},{name:"มูลค่าคงเหลือ",value:data.summary.inventoryValue,color:"#168fa7"}]} center={<WalletCards size={28}/>}><p><i style={{background:"#8f48b8"}}/><span>มูลค่าใช้สะสม<br/><b>{baht(data.summary.totalUsageValue)}</b></span></p><p><i style={{background:"#168fa7"}}/><span>มูลค่าคงเหลือ<br/><b>{baht(data.summary.inventoryValue)}</b></span></p></Donut></Panel>
        <Panel title="สัดส่วนสถานะสต็อก"><Donut rows={stockPie} center={<Box size={27}/>} >{stockPie.map(r=><p key={r.name}><i style={{background:r.color}}/><span>{r.name}<br/><b>{nf.format(r.value)} รายการ ({nf.format(r.value/data.summary.items*100)}%)</b></span></p>)}</Donut></Panel>
      </div>
    </div>

    <div className="bottom-grid">
      <Panel title="แนวโน้มการใช้ยา (มูลค่า) ย้อนหลัง 6 เดือน" tone="teal"><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={data.monthly} margin={{top:14,right:12,left:-8,bottom:0}}><defs><linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#66309c" stopOpacity={.18}/><stop offset="100%" stopColor="#66309c" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#dce5ee"/><XAxis dataKey="month" tick={{fontSize:12}}/><YAxis yAxisId="left" tick={{fontSize:11}}/><YAxis yAxisId="right" orientation="right" tick={{fontSize:11}}/><Tooltip formatter={(v)=>nf.format(Number(v))}/><Legend/><Bar yAxisId="right" dataKey="qty" name="จำนวนหน่วยใช้" fill="#38bdd1" radius={[3,3,0,0]}/><Area yAxisId="left" type="monotone" dataKey="value" name="มูลค่าใช้ (บาท)" stroke="#65309c" strokeWidth={3} fill="url(#areaFill)" dot={{r:4}}/></ComposedChart></ResponsiveContainer></div></Panel>
      <Panel title="ตัวชี้วัดสำคัญ"><div className="kpi-list"><p><ChartNoAxesCombined/><span>อัตราการใช้ยาเทียบกับการเบิก (มูลค่า)</span><b>{nf.format(data.summary.useToReceivePct)}%</b></p><p><Clock3/><span>จำนวนเดือนคงคลัง (เฉลี่ยถ่วงน้ำหนัก)</span><b>{nf.format(data.summary.monthsCoverAvg)} เดือน</b></p><p><Coins/><span>มูลค่ายาใกล้หมดอายุ (≤ 90 วัน)</span><b>{baht(data.summary.expiringValue)}</b></p></div></Panel>
      <Panel title="ข้อแนะนำเพื่อการบริหารจัดการ"><div className="recommend-list"><p><ShoppingCart/><span>พิจารณาจัดซื้อเพิ่ม: <b>{data.summary.outStock} รายการ (หมดสต็อก)</b></span></p><p><HandCoins/><span>จัดซื้อทดแทน: <b>{data.summary.belowThreshold} รายการ (ต่ำกว่าเกณฑ์)</b></span></p><p><Clock3/><span>เร่งบริหารจัดการ: <b>{data.summary.nearExpiry} รายการ (ใกล้หมดอายุ ≤ 90 วัน)</b></span></p><p><AlertTriangle/><span>ติดตามใกล้ชิด: <b>{data.summary.lowCover} รายการ (คงเหลือไม่ถึง 1 เดือน)</b></span></p></div></Panel>
    </div>
    <footer><Stethoscope size={16}/> แหล่งข้อมูล: {data.sourceFile} • คำนวณจากข้อมูล {data.summary.items} รายการยา</footer>
  </main>;
}
