import { getAllVideos, getAllTeachers } from '@/lib/data'
import VideoCard from '@/components/video-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function CategoriesPage() {
  const videos = getAllVideos()
  const teachers = getAllTeachers()

  // Get unique categories
  const categories = Array.from(new Set(videos.map(video => video.category)))

  return (
    <div className='py-10'>
      <div className='flex flex-col gap-4 mb-8'>
        <h1 className='text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300'>
          Browse by Category
        </h1>
        <p className='text-slate-600 dark:text-slate-400 max-w-2xl'>
          Explore our video lessons organized by subject area.
        </p>
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
                .map(video => {
                  const teacher = teachers.find(t => t.id === video.teacherId)
                  return (
                    <VideoCard key={video.id} video={video} teacher={teacher} showTeacher={true} />
                  )
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
