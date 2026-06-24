
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, LineChart, TrendingDown, Users, DollarSign, Activity } from "lucide-react"
import {
  Line,
  LineChart as RechartsLineChart,
  Bar,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// VNB Result Data from the provided file
const vnbResultData = [
  { mpId: "MP_26_001", age: 32, premium: 180000, vnbVal: -22375027, marginRate: -51.79, execDt: "2026-02-05" },
  { mpId: "MP_26_002", age: 35, premium: 160000, vnbVal: -28240197, marginRate: -73.54, execDt: "2026-02-05" },
  { mpId: "MP_26_003", age: 40, premium: 240000, vnbVal: -42218240, marginRate: -73.3, execDt: "2026-02-05" },
  { mpId: "MP_26_004", age: 40, premium: 220000, vnbVal: -41093440, marginRate: -77.83, execDt: "2026-02-05" },
  { mpId: "MP_26_005", age: 42, premium: 260000, vnbVal: -48320908, marginRate: -77.44, execDt: "2026-02-05" },
  { mpId: "MP_26_006", age: 45, premium: 290000, vnbVal: -43712450, marginRate: -125.61, execDt: "2026-02-05" },
  { mpId: "MP_26_007", age: 48, premium: 310000, vnbVal: -51638830, marginRate: -138.81, execDt: "2026-02-05" },
  { mpId: "MP_26_008", age: 50, premium: 330000, vnbVal: -52239479, marginRate: -131.92, execDt: "2026-02-05" },
  { mpId: "MP_26_009", age: 52, premium: 350000, vnbVal: -58967912, marginRate: -140.4, execDt: "2026-02-05" },
  { mpId: "MP_26_010", age: 55, premium: 300000, vnbVal: -41021430, marginRate: -113.95, execDt: "2026-02-05" },
]

// Model Parameter Data
const modelParamData = [
  { mpId: "MP_26_001", prodCd: "PD_A", age: 32, gender: "M", payTerm: "20Y", insTerm: "80Y", mainAmt: 50000000, premium: 180000 },
  { mpId: "MP_26_002", prodCd: "PD_A", age: 35, gender: "F", payTerm: "20Y", insTerm: "80Y", mainAmt: 50000000, premium: 160000 },
  { mpId: "MP_26_003", prodCd: "PD_A", age: 40, gender: "M", payTerm: "20Y", insTerm: "80Y", mainAmt: 50000000, premium: 240000 },
  { mpId: "MP_26_004", prodCd: "PD_A", age: 40, gender: "F", payTerm: "20Y", insTerm: "80Y", mainAmt: 50000000, premium: 220000 },
  { mpId: "MP_26_005", prodCd: "PD_A", age: 42, gender: "M", payTerm: "20Y", insTerm: "80Y", mainAmt: 50000000, premium: 260000 },
]

// Prepare chart data
const vnbByAgeData = vnbResultData.map(item => ({
  age: item.age,
  vnb: Math.abs(item.vnbVal) / 1000000, // Convert to millions for readability
  marginRate: item.marginRate,
}))

const premiumByAgeData = vnbResultData.map(item => ({
  age: item.age,
  premium: item.premium / 1000, // Convert to thousands
}))

// Calculate summary statistics
const totalVnb = vnbResultData.reduce((sum, item) => sum + item.vnbVal, 0)
const avgMarginRate = vnbResultData.reduce((sum, item) => sum + item.marginRate, 0) / vnbResultData.length
const totalContracts = vnbResultData.length
const avgPremium = vnbResultData.reduce((sum, item) => sum + item.premium, 0) / vnbResultData.length

export function VnbDashboard() {
  return (
    <div className="h-full overflow-auto bg-background p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">VNB 분석 대시보드</h1>
        <p className="text-muted-foreground mt-2">순현재가치 및 영업 보험료 시뮬레이션 결과</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">총 VNB</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {(totalVnb / 1000000).toFixed(1)}M 원
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              전체 계약 합계
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">평균 마진율</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {avgMarginRate.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              수익성 지표
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">계약 건수</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalContracts}건
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              총 시뮬레이션 계약
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">평균 보험료</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {(avgPremium / 1000).toFixed(0)}K 원
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              월 평균
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* VNB by Age Line Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary" />
              연령별 VNB 추이
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              가입 연령에 따른 순현재가치 변화
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={vnbByAgeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="age" 
                  stroke="hsl(var(--foreground))" 
                  label={{ value: '나이', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--foreground))" 
                  label={{ value: 'VNB (백만원)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="vnb" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="VNB (백만원)"
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Premium by Age Bar Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              연령별 영업 보험료
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              가입 연령에 따른 월 보험료 비교
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={premiumByAgeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="age" 
                  stroke="hsl(var(--foreground))"
                  label={{ value: '나이', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--foreground))"
                  label={{ value: '보험료 (천원)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="premium" 
                  fill="hsl(var(--primary))" 
                  name="보험료 (천원)"
                  radius={[8, 8, 0, 0]}
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Margin Rate Chart */}
      <Card className="bg-card border-border mb-6">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            연령별 마진율 분석
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            가입 연령에 따른 수익성 지표
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={vnbByAgeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="age" 
                stroke="hsl(var(--foreground))"
                label={{ value: '나이', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                stroke="hsl(var(--foreground))"
                label={{ value: '마진율 (%)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="marginRate" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                name="마진율 (%)"
                dot={{ fill: 'hsl(var(--destructive))' }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">VNB 상세 결과</CardTitle>
          <CardDescription className="text-muted-foreground">
            전체 시뮬레이션 계약 데이터
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">MP ID</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">연령</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">보험료</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">VNB</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">마진율</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">실행일자</th>
                </tr>
              </thead>
              <tbody>
                {vnbResultData.map((item, index) => (
                  <tr key={index} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-4 text-foreground font-mono text-xs">{item.mpId}</td>
                    <td className="py-3 px-4 text-right text-foreground">{item.age}</td>
                    <td className="py-3 px-4 text-right text-foreground">{item.premium.toLocaleString()}원</td>
                    <td className="py-3 px-4 text-right text-destructive font-semibold">{item.vnbVal.toLocaleString()}원</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">{item.marginRate.toFixed(2)}%</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.execDt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
