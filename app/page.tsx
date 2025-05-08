import { getAllVideos, getAllTeachers } from '@/lib/data'
import VideoCard from '@/components/video-card'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Loading component for videos
function VideosSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className='rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden h-full'>
            <Skeleton className='aspect-video w-full' />
            <div className='p-4 flex flex-col h-[calc(100%-56.25%)]'>
              <Skeleton className='h-6 w-3/4 mb-2' />
              <Skeleton className='h-4 w-1/4 mb-4' />
              <Skeleton className='h-4 w-full mb-2' />
              <Skeleton className='h-4 w-2/3 mb-4 flex-grow' />
              <Skeleton className='h-10 w-full mt-auto' />
            </div>
          </div>
        ))}
    </div>
  )
}

// Component to fetch and display videos
function Videos() {
  // Get all videos and sort by date (newest first)
  const videos = getAllVideos().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const teachers = getAllTeachers()

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {videos.map(video => {
        // Find the teacher for this video
        const teacher = teachers.find(t => t.id === video.teacherId)
        return <VideoCard key={video.id} video={video} teacher={teacher} showTeacher={true} />
      })}
    </div>
  )
}

export default function Home() {
  return (
    <div className='py-10'>
      <div className='flex flex-col gap-8'>
        <div className='flex flex-col gap-4'>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300'>
            Latest Video Lessons
          </h1>
          <p className='text-slate-600 dark:text-slate-400 max-w-2xl'>
            Browse our collection of educational videos from our expert teachers. Click on a
            teacher's avatar to see all their lessons.
          </p>
        </div>

        <Suspense fallback={<VideosSkeleton />}>
          <Videos />
        </Suspense>
      </div>
    </div>
  )
}
