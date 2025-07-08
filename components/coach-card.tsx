import type { Coach } from "@/lib/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface CoachCardProps {
  coach: Coach
}

export default function CoachCard({ coach }: CoachCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={coach.avatar || "/placeholder.svg"} alt={coach.name} />
            <AvatarFallback>{coach.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">{coach.name}</h2>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pb-6">
        <Button asChild>
          <Link href={`/coaches/${coach.id}`}>View Lessons</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
