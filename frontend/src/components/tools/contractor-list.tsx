
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users } from "lucide-react"

interface Contractor {
  id: string
  customerId: string
  name: string
  age: number
  gender: string
  coverageAmount: number
  premium: number
}

// Sample contractor data
const contractorData: Contractor[] = [
  {
    id: "1",
    customerId: "C2024-0001",
    name: "김민수",
    age: 35,
    gender: "남성",
    coverageAmount: 100000000,
    premium: 85300,
  },
  {
    id: "2",
    customerId: "C2024-0002",
    name: "이수진",
    age: 28,
    gender: "여성",
    coverageAmount: 80000000,
    premium: 63500,
  },
  {
    id: "3",
    customerId: "C2024-0003",
    name: "박지훈",
    age: 42,
    gender: "남성",
    coverageAmount: 150000000,
    premium: 127800,
  },
  {
    id: "4",
    customerId: "C2024-0004",
    name: "최서연",
    age: 31,
    gender: "여성",
    coverageAmount: 90000000,
    premium: 71200,
  },
  {
    id: "5",
    customerId: "C2024-0005",
    name: "정우성",
    age: 39,
    gender: "남성",
    coverageAmount: 120000000,
    premium: 98600,
  },
  {
    id: "6",
    customerId: "C2024-0006",
    name: "한지민",
    age: 33,
    gender: "여성",
    coverageAmount: 100000000,
    premium: 79400,
  },
  {
    id: "7",
    customerId: "C2024-0007",
    name: "강동원",
    age: 45,
    gender: "남성",
    coverageAmount: 200000000,
    premium: 156900,
  },
  {
    id: "8",
    customerId: "C2024-0008",
    name: "송혜교",
    age: 38,
    gender: "여성",
    coverageAmount: 110000000,
    premium: 87500,
  },
]

export function ContractorList() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">계약자명단</h3>
        <span className="text-sm text-muted-foreground ml-auto">
          총 {contractorData.length}명
        </span>
      </div>
      
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur">
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-foreground font-semibold">고객번호</TableHead>
              <TableHead className="text-foreground font-semibold">이름</TableHead>
              <TableHead className="text-foreground font-semibold">나이</TableHead>
              <TableHead className="text-foreground font-semibold">성별</TableHead>
              <TableHead className="text-foreground font-semibold text-right">가입금액</TableHead>
              <TableHead className="text-foreground font-semibold text-right">영업보험료</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contractorData.map((contractor) => (
              <TableRow 
                key={contractor.id} 
                className="hover:bg-secondary/50 border-border transition-colors"
              >
                <TableCell className="font-mono text-sm text-foreground">
                  {contractor.customerId}
                </TableCell>
                <TableCell className="text-foreground">{contractor.name}</TableCell>
                <TableCell className="text-foreground">{contractor.age}세</TableCell>
                <TableCell className="text-foreground">{contractor.gender}</TableCell>
                <TableCell className="text-right text-foreground">
                  {contractor.coverageAmount.toLocaleString()}원
                </TableCell>
                <TableCell className="text-right font-semibold text-primary">
                  {contractor.premium.toLocaleString()}원
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
