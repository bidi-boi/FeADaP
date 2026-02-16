import { decodeTasks } from "@/lib/data";
import { Task } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, AlertCircle, Dumbbell, Flame } from "lucide-react";
import { Metadata } from "next";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

interface Props {
  searchParams: SearchParams;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const data = searchParams.data;

  if (typeof data !== 'string') return {};

  const tasks = decodeTasks(data);
  const total = tasks.length;
  const completed = tasks.filter(t => t.done).length;

  return {
    title: "Fe-Accountability Progress",
    description: `Completed ${completed} out of ${total} tasks today.`,
    openGraph: {
      images: [
        {
          url: `/api/og?completed=${completed}&total=${total}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function PublicView(props: Props) {
  const searchParams = await props.searchParams;
  const data = searchParams.data;

  if (typeof data !== 'string') {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
            No progress data found.
        </div>
    );
  }

  const tasks = decodeTasks(data);
  const total = tasks.length;
  const completed = tasks.filter(t => t.done).length;
  const percentage = total === 0 ? 0 : (completed / total) * 100;

  // Status Indicator Logic
  let status = { text: "Needs a Push", color: "bg-red-500", icon: AlertCircle };
  if (percentage >= 100) status = { text: "Done!", color: "bg-green-600", icon: CheckCircle2 };
  else if (percentage >= 80) status = { text: "Crushing It", color: "bg-green-500", icon: Flame };
  else if (percentage >= 40) status = { text: "Grinding", color: "bg-yellow-500", icon: Dumbbell };

  // Helper to calculate task progress (if subtasks exist)
  const getTaskProgress = (task: Task) => {
    if (task.subtasks.length === 0) return task.done ? 100 : 0;
    const completedSub = task.subtasks.filter(st => st.done).length;
    return (completedSub / task.subtasks.length) * 100;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
       <div className="max-w-md w-full space-y-8">
           <div className="text-center space-y-4">
               <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">How's it going?</h1>

               <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-lg shadow-md transition-transform hover:scale-105 ${status.color}`}>
                   <status.icon className="w-6 h-6" />
                   {status.text}
               </div>
           </div>

           <Card className="shadow-xl border-t-4 border-t-slate-800">
               <CardHeader className="pb-2">
                   <CardTitle className="text-center text-2xl font-bold">Today's Focus</CardTitle>
                   <div className="text-center text-sm text-slate-500">
                        {completed} / {total} High Level Tasks
                   </div>
               </CardHeader>
               <CardContent className="space-y-6 pt-4">
                   {tasks.map(task => {
                       const taskProgress = getTaskProgress(task);
                       const isDone = task.done || taskProgress === 100;

                       return (
                           <div key={task.id} className="space-y-1">
                               <div className="flex justify-between items-center mb-1">
                                   <span className={`font-medium text-lg ${isDone ? "text-slate-400 line-through" : "text-slate-800"}`}>
                                       {task.title}
                                   </span>
                                   <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                                       {Math.round(taskProgress)}%
                                   </span>
                               </div>
                               <Progress value={taskProgress} className="h-2" />
                           </div>
                       );
                   })}
               </CardContent>
           </Card>

           <div className="text-center text-slate-400 text-sm mt-8">
               <span className="opacity-50">Powered by</span> <span className="font-semibold text-slate-600">Fe-Accountability</span>
           </div>
       </div>
    </div>
  );
}
