import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Droplets,
  Calculator,
  Sliders,
  HelpCircle,
  Coins,
  Gauge,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import Card from '../components/Card';
import { getStoredFields } from '../lib/fields';
import { useLanguage } from '../context/LanguageContext';

/**
 * Constants based on Indus Basin / Khairpur agro-irrigation practices:
 * - Traditional flood irrigation: ~75 mm (~303,500 L/acre)
 * - KhetiX precision irrigation: ~40 mm (~161,880 L/acre)
 * - Net water saved per acre per cycle: ~141,600 L/acre
 * - Diesel pump fuel consumption: ~1.5 L per 10,000 L pumped
 * - Average Diesel price in Pakistan: ~PKR 285 / Litre
 */
const TRADITIONAL_MM_PER_CYCLE = 75;
const KHETIX_MM_PER_CYCLE = 40;
const DIESEL_PER_10K_LITRES = 1.5;
const DIESEL_PRICE_PKR = 285;
const PUMP_RATE_LITRES_PER_HOUR = 40000;

export default function Savings() {
  const { t } = useLanguage();
  const [fields] = useState(() => getStoredFields());

  // Interactive slider state (1 to 50 acres)
  const [calculatorAcres, setCalculatorAcres] = useState(10);

  // Field-wise calculations
  const fieldSavings = useMemo(() => {
    return fields.map((f) => {
      const acres = Number(f.areaAcres) || 5;
      // Assume typical 3 irrigation turns per season so far
      const turns = 3;
      const traditionalL = TRADITIONAL_MM_PER_CYCLE * acres * 4047 * turns;
      const khetixL = KHETIX_MM_PER_CYCLE * acres * 4047 * turns;
      const savedL = Math.max(0, traditionalL - khetixL);
      const savedPkr = Math.round((savedL / 10000) * DIESEL_PER_10K_LITRES * DIESEL_PRICE_PKR);

      return {
        ...f,
        savedL,
        savedPkr,
        turns,
      };
    });
  }, [fields]);

  // Aggregate totals across all farm plots
  const totalSavedLitres = useMemo(
    () => fieldSavings.reduce((acc, f) => acc + f.savedL, 0),
    [fieldSavings]
  );

  const totalSavedPkr = useMemo(
    () => fieldSavings.reduce((acc, f) => acc + f.savedPkr, 0),
    [fieldSavings]
  );

  // Calculator projections for slider
  const calcResults = useMemo(() => {
    const turnsPerMonth = 2; // Typically 2 irrigation events per month
    const waterSavedPerCycle = (TRADITIONAL_MM_PER_CYCLE - KHETIX_MM_PER_CYCLE) * calculatorAcres * 4047;
    const monthlyWaterSaved = waterSavedPerCycle * turnsPerMonth;
    const monthlyDieselSaved = Math.round((monthlyWaterSaved / 10000) * DIESEL_PER_10K_LITRES);
    const monthlyMoneySaved = Math.round(monthlyDieselSaved * DIESEL_PRICE_PKR);
    const tubewellHoursSaved = Math.round(monthlyWaterSaved / PUMP_RATE_LITRES_PER_HOUR);

    return {
      monthlyWaterSaved,
      monthlyDieselSaved,
      monthlyMoneySaved,
      tubewellHoursSaved,
    };
  }, [calculatorAcres]);

  // Comparison chart data (Traditional vs KhetiX water applied per cycle)
  const chartData = [
    { period: 'Turn 1', Traditional: 75, KhetiX: 40 },
    { period: 'Turn 2', Traditional: 75, KhetiX: 38 },
    { period: 'Turn 3', Traditional: 75, KhetiX: 42 },
    { period: 'Turn 4', Traditional: 75, KhetiX: 35 },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-dark-brown">
          {t('savingsScreen.title') || 'Water & Cost Savings'}
        </h1>
        <p className="text-sm sm:text-base text-dark-brown/70 mt-0.5">
          {t('savingsScreen.subtitle') ||
            'KhetiX Precision vs Traditional Flood Irrigation in Sindh'}
        </p>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Water Saved */}
        <Card className="border-t-4 border-water-blue flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-water-blue text-xs font-bold uppercase tracking-wide">
              <Droplets className="w-4 h-4" />
              <span>{t('savingsScreen.totalWaterSaved') || 'Water Saved'}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-heading font-black text-dark-brown mt-2">
              {(totalSavedLitres / 1000000).toFixed(2)}M{' '}
              <span className="text-sm font-semibold text-dark-brown/60">L</span>
            </div>
          </div>
          <p className="text-xs text-dark-brown/65 mt-2">
            {t('savingsScreen.vsFlood') || 'vs 75 mm conventional flooding'}
          </p>
        </Card>

        {/* Estimated Money Saved */}
        <Card className="border-t-4 border-leaf-green flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-leaf-green text-xs font-bold uppercase tracking-wide">
              <Coins className="w-4 h-4" />
              <span>{t('savingsScreen.estimatedMoneySaved') || 'Money Saved'}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-heading font-black text-dark-brown mt-2">
              Rs {totalSavedPkr.toLocaleString()}
            </div>
          </div>
          <p className="text-xs text-dark-brown/65 mt-2">
            {t('savingsScreen.dieselPkr') || 'Diesel & electricity savings'}
          </p>
        </Card>

        {/* Irrigation Efficiency Score */}
        <Card className="border-t-4 border-wheat-yellow flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-wheat-yellow text-xs font-bold uppercase tracking-wide">
              <Gauge className="w-4 h-4" />
              <span>{t('savingsScreen.efficiencyScore') || 'Efficiency Gain'}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-heading font-black text-dark-brown mt-2">
              +47%
            </div>
          </div>
          <p className="text-xs text-dark-brown/65 mt-2">
            Root water productivity index
          </p>
        </Card>
      </div>

      {/* Field-by-Field Savings Breakdown Table */}
      <Card className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-heading font-bold text-dark-brown">
            {t('savingsScreen.breakdownTitle') || 'Field-by-Field Savings Breakdown'}
          </h2>
          <span className="text-xs text-dark-brown/60 font-semibold">
            {fields.length} Registered Plots
          </span>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[340px]">
            <thead>
              <tr className="border-b border-[#E0D7C6] bg-[#F5EEDB]/60 text-dark-brown/80">
                <th className="py-2.5 px-3 font-bold">
                  {t('savingsScreen.tableField') || 'Field Name'}
                </th>
                <th className="py-2.5 px-2 font-bold">
                  {t('savingsScreen.tableCrop') || 'Crop'}
                </th>
                <th className="py-2.5 px-2 font-bold">
                  {t('savingsScreen.tableLastIrrigated') || 'Last Watered'}
                </th>
                <th className="py-2.5 px-2 font-bold text-water-blue">
                  {t('savingsScreen.tableSavedWater') || 'Water Saved'}
                </th>
                <th className="py-2.5 px-3 font-bold text-leaf-green text-right">
                  {t('savingsScreen.tableSavedMoney') || 'Saved (PKR)'}
                </th>
              </tr>
            </thead>
            <tbody>
              {fieldSavings.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[#E0D7C6]/40 hover:bg-[#FFF8E1]/60 transition-colors"
                >
                  <td className="py-3 px-3 font-semibold text-dark-brown whitespace-nowrap">
                    {item.name}
                    <span className="block text-[11px] text-dark-brown/60 font-normal">
                      {item.areaAcres} Acres • {item.taluka}
                    </span>
                  </td>
                  <td className="py-3 px-2 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        item.crop === 'wheat'
                          ? 'bg-wheat-yellow/20 text-[#B7791F]'
                          : 'bg-water-blue/15 text-water-blue'
                      }`}
                    >
                      {item.crop === 'wheat' ? 'Wheat' : 'Cotton'}
                    </span>
                  </td>
                  <td className="py-3 px-2 whitespace-nowrap text-dark-brown/70 text-xs">
                    {item.lastIrrigationDate || 'Recent'}
                  </td>
                  <td className="py-3 px-2 font-bold text-water-blue whitespace-nowrap">
                    {(item.savedL / 1000).toLocaleString()} kL
                  </td>
                  <td className="py-3 px-3 font-extrabold text-leaf-green text-right whitespace-nowrap">
                    Rs {item.savedPkr.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Interactive Water Saved Calculator */}
      <Card className="border-2 border-leaf-green/20 space-y-4">
        <div className="flex items-start gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-leaf-green/10 text-leaf-green flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-heading font-bold text-dark-brown">
              {t('savingsScreen.calculatorTitle') || 'Interactive Farm Savings Calculator'}
            </h2>
            <p className="text-xs sm:text-sm text-dark-brown/70 mt-0.5">
              {t('savingsScreen.calculatorSubtitle') ||
                'Adjust your farm acres to project monthly water and tube-well diesel savings'}
            </p>
          </div>
        </div>

        {/* Acres Slider Input */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-dark-brown/80 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-leaf-green" />
              {t('savingsScreen.acresLabel') || 'Farm Size'}:
            </span>
            <span className="px-3 py-1 rounded-lg bg-leaf-green text-white font-heading font-extrabold text-base">
              {calculatorAcres} Acres
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={calculatorAcres}
            onChange={(e) => setCalculatorAcres(Number(e.target.value))}
            className="w-full h-2.5 bg-[#F5EEDB] rounded-lg appearance-none cursor-pointer accent-leaf-green"
          />

          <div className="flex justify-between text-[11px] text-dark-brown/60 px-0.5">
            <span>1 Acre</span>
            <span>25 Acres</span>
            <span>50 Acres</span>
          </div>
        </div>

        {/* Dynamic Calculator Output Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          {/* Monthly Water Saved */}
          <div className="p-3 rounded-xl bg-[#FFF8E1] border border-[#E0D7C6]">
            <span className="text-[11px] font-bold text-water-blue uppercase block truncate">
              {t('savingsScreen.monthlyWaterSaved') || 'Water Saved'}
            </span>
            <div className="text-lg font-heading font-extrabold text-dark-brown mt-1">
              {(calcResults.monthlyWaterSaved / 1000).toLocaleString()}{' '}
              <span className="text-xs font-normal">kL</span>
            </div>
            <span className="text-[10px] text-dark-brown/60">Per Month</span>
          </div>

          {/* Monthly Diesel Saved */}
          <div className="p-3 rounded-xl bg-[#FFF8E1] border border-[#E0D7C6]">
            <span className="text-[11px] font-bold text-wheat-yellow uppercase block truncate">
              {t('savingsScreen.monthlyDieselSaved') || 'Diesel Saved'}
            </span>
            <div className="text-lg font-heading font-extrabold text-dark-brown mt-1">
              {calcResults.monthlyDieselSaved}{' '}
              <span className="text-xs font-normal">Litres</span>
            </div>
            <span className="text-[10px] text-dark-brown/60">~1.5 L / 10k L</span>
          </div>

          {/* Monthly Money Saved */}
          <div className="p-3 rounded-xl bg-[#FFF8E1] border border-leaf-green/40">
            <span className="text-[11px] font-bold text-leaf-green uppercase block truncate">
              {t('savingsScreen.monthlyMoneySaved') || 'Money Saved'}
            </span>
            <div className="text-lg font-heading font-extrabold text-leaf-green mt-1">
              Rs {calcResults.monthlyMoneySaved.toLocaleString()}
            </div>
            <span className="text-[10px] text-dark-brown/60">@ Rs 285/L</span>
          </div>

          {/* Tube-well Hours Saved */}
          <div className="p-3 rounded-xl bg-[#FFF8E1] border border-[#E0D7C6]">
            <span className="text-[11px] font-bold text-dark-brown/80 uppercase block truncate">
              {t('savingsScreen.tubewellHoursSaved') || 'Pump Hours'}
            </span>
            <div className="text-lg font-heading font-extrabold text-dark-brown mt-1">
              {calcResults.tubewellHoursSaved}{' '}
              <span className="text-xs font-normal">Hours</span>
            </div>
            <span className="text-[10px] text-dark-brown/60">Less Runtime</span>
          </div>
        </div>
      </Card>

      {/* Visual Water Comparison Chart */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-heading font-bold text-dark-brown">
              Irrigation Depth Comparison (mm applied per turn)
            </h3>
            <p className="text-xs text-dark-brown/60">
              Flood (75 mm) vs KhetiX Precision (~40 mm)
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-light-green/20 flex items-center justify-center text-leaf-green">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="h-52 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis dataKey="period" stroke="#3E2723" opacity={0.6} fontSize={12} />
              <YAxis
                stroke="#3E2723"
                opacity={0.6}
                fontSize={12}
                unit=" mm"
                domain={[0, 80]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E0D7C6',
                  color: '#3E2723',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Traditional" fill="#0288D1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="KhetiX" fill="#2E7D32" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Methodology Rule-of-Thumb Callout Card */}
      <Card className="bg-[#FFF8E1] border border-wheat-yellow/40 space-y-2 text-xs sm:text-sm text-dark-brown/85">
        <div className="flex items-center gap-2 text-dark-brown font-heading font-bold">
          <HelpCircle className="w-4 h-4 text-wheat-yellow" />
          <span>{t('savingsScreen.ruleOfThumbTitle') || 'How We Calculate Savings'}</span>
        </div>
        <p className="leading-relaxed">
          {t('savingsScreen.ruleOfThumbText') ||
            'Traditional flood irrigation typically applies ~75 mm (~300,000 L/acre) per turn regardless of need. KhetiX recommends the exact crop requirement (35-45 mm), saving ~130,000 litres per acre per turn. Pumping 10,000 litres of groundwater consumes ~1.5 litres of diesel, yielding direct fuel savings of ~PKR 425 per 10k litres.'}
        </p>
      </Card>
    </div>
  );
}
