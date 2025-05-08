import { getTeacherById, getVideosByTeacherId } from '@/lib/data'
import { notFound } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import VideoCard from '@/components/video-card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TeacherPage({ params }: { params: { teacherId: string } }) {
  const teacher = getTeacherById(params.teacherId)

  if (!teacher) {
    notFound()
  }

  const videos = getVideosByTeacherId(params.teacherId)

  // Get unique categories
  const categories = Array.from(new Set(videos.map(video => video.category)))

  return (
    <div className='py-10'>
      <Link
        href='/'
        className='inline-flex items-center text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-6 transition-colors'>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back to all videos
      </Link>

      <div className='flex flex-col md:flex-row md:items-center gap-6 mb-10 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 rounded-xl'>
        <Avatar className='h-24 w-24 border-4 border-white dark:border-slate-700 shadow-md'>
          <AvatarImage src={teacher.avatar || '/placeholder.svg'} alt={teacher.name} />
          <AvatarFallback className='text-2xl'>{teacher.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className='text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300'>
            {teacher.name}
          </h1>
          <p className='text-slate-600 dark:text-slate-400 mt-2'>
            {videos.length} video lessons across {categories.length} categories
          </p>
        </div>
      </div>

      <Tabs defaultValue={categories[0]} className='w-full'>
        <TabsList className='mb-8 w-full justify-start overflow-auto'>
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className='px-6'>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category} value={category}>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {videos
                .filter(video => video.category === category)
                .map(video => (
                  <VideoCard key={video.id} video={video} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
