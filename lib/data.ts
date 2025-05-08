import type { Teacher, Video } from "./types"

// Mock data for teachers
const teachers: Teacher[] = [
  {
    id: "john-doe",
    name: "John Doe",
    avatar: "/teacher-with-glasses.png",
  },
  {
    id: "jane-smith",
    name: "Jane Smith",
    avatar: "/smiling-female-teacher.png",
  },
  {
    id: "alex-johnson",
    name: "Alex Johnson",
    avatar: "/young-male-teacher.png",
  },
]

// Mock data for videos
const videos: Video[] = [
  {
    id: "html-basics",
    title: "HTML Basics: Structure of a Webpage",
    date: "2023-09-15",
    videoUrl: "https://www.youtube.com/watch?v=UB1O30fR-EE",
    category: "HTML",
    teacherId: "john-doe",
    description: "Learn the fundamental structure of HTML documents and how to create your first webpage.",
    githubUrl: "https://github.com/letphil/html-basics",
  },
  {
    id: "html-forms",
    title: "Creating Forms in HTML",
    date: "2023-09-22",
    videoUrl: "https://www.youtube.com/watch?v=fNcJuPIZ2WE",
    category: "HTML",
    teacherId: "john-doe",
    description: "Understand how to create interactive forms to collect user input.",
    githubUrl: "https://github.com/letphil/html-forms",
  },
  {
    id: "css-intro",
    title: "Introduction to CSS",
    date: "2023-10-01",
    videoUrl: "https://www.youtube.com/watch?v=1PnVor36_40",
    category: "CSS",
    teacherId: "john-doe",
    description: "Learn how to style your HTML pages with CSS.",
    githubUrl: "https://github.com/letphil/css-intro",
  },
  {
    id: "css-flexbox",
    title: "CSS Flexbox Layout",
    date: "2023-10-08",
    videoUrl: "https://www.youtube.com/watch?v=JJSoEo8JSnc",
    category: "CSS",
    teacherId: "jane-smith",
    description: "Master the flexible box layout model in CSS.",
    githubUrl: "https://github.com/letphil/css-flexbox",
  },
  {
    id: "js-basics",
    title: "JavaScript Fundamentals",
    date: "2023-10-15",
    videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
    category: "JavaScript",
    teacherId: "jane-smith",
    description: "Get started with JavaScript programming language basics.",
    githubUrl: "https://github.com/letphil/js-basics",
  },
  {
    id: "js-dom",
    title: "JavaScript DOM Manipulation",
    date: "2023-10-22",
    videoUrl: "https://www.youtube.com/watch?v=5fb2aPlgoys",
    category: "JavaScript",
    teacherId: "jane-smith",
    description: "Learn how to interact with the Document Object Model using JavaScript.",
    githubUrl: "https://github.com/letphil/js-dom",
  },
  {
    id: "react-intro",
    title: "Introduction to React",
    date: "2023-11-01",
    videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk",
    category: "React",
    teacherId: "alex-johnson",
    description: "Get started with React library for building user interfaces.",
    githubUrl: "https://github.com/letphil/react-intro",
  },
  {
    id: "react-hooks",
    title: "React Hooks Explained",
    date: "2023-11-08",
    videoUrl: "https://www.youtube.com/watch?v=TNhaISOUy6Q",
    category: "React",
    teacherId: "alex-johnson",
    description: "Understand how to use React Hooks for state and side effects in functional components.",
    githubUrl: "https://github.com/letphil/react-hooks",
  },
  {
    id: "react-router",
    title: "Routing in React with React Router",
    date: "2023-11-15",
    videoUrl: "/videos/sample-video.mp4",
    category: "React",
    teacherId: "alex-johnson",
    description: "Learn how to implement navigation in your React applications.",
    githubUrl: "https://github.com/letphil/react-router",
  },
]

// Helper functions to access the data
export function getAllTeachers(): Teacher[] {
  return teachers
}

export function getTeacherById(id: string): Teacher | undefined {
  return teachers.find((teacher) => teacher.id === id)
}

export function getAllVideos(): Video[] {
  return videos
}

export function getVideosByTeacherId(teacherId: string): Video[] {
  return videos.filter((video) => video.teacherId === teacherId)
}

export function getVideosByCategory(category: string): Video[] {
  return videos.filter((video) => video.category === category)
}
