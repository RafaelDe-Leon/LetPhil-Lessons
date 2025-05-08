import { getAllTeachers } from '@/lib/data'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TeachersPage() {
  const teachers = getAllTeachers()

  return (
    <div className='py-10'>
      <div className='flex flex-col gap-4 mb-8'>
        <h1 className='text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300'>
          Our Teachers
        </h1>
        <p className='text-slate-600 dark:text-slate-400 max-w-2xl'>
          Meet our expert educators and explore their video lessons.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {teachers.map(teacher => (
          <Card
            key={teacher.id}
            className='overflow-hidden transition-all duration-300 hover:shadow-lg border-slate-200 dark:border-slate-800'>
            <CardContent className='p-6'>
              <div className='flex flex-col items-center text-center'>
                <Avatar className='h-32 w-32 mb-4 border-4 border-white dark:border-slate-700 shadow-md'>
                  <AvatarImage src={teacher.avatar || '/placeholder.svg'} alt={teacher.name} />
                  <AvatarFallback className='text-3xl'>{teacher.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className='text-xl font-bold'>{teacher.name}</h2>
              </div>
            </CardContent>
            <CardFooter className='flex justify-center pb-6'>
              <Button asChild className='w-full'>
                <Link href={`/teachers/${teacher.id}`}>View Lessons</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
