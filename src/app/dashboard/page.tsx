"use client";

import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Task, SubTask } from "@/lib/types";
import { encodeTasks } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Share2, Trash2, CheckCircle2 } from "lucide-react";

export default function Dashboard() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", []);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [importJson, setImportJson] = useState("");
  const [newSubTaskTitles, setNewSubTaskTitles] = useState<Record<string, string>>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      done: false,
      subtasks: []
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const toggleTask = (task: Task) => {
    const newDone = !task.done;
    if (task.subtasks.length > 0) {
      // Toggle all subtasks
      const updatedSubtasks = task.subtasks.map(st => ({ ...st, done: newDone }));
      updateTask({ ...task, done: newDone, subtasks: updatedSubtasks });
    } else {
      updateTask({ ...task, done: newDone });
    }
  };

  const addSubTask = (taskId: string) => {
    const title = newSubTaskTitles[taskId];
    if (!title?.trim()) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSubTask: SubTask = {
      id: crypto.randomUUID(),
      title: title,
      done: false
    };

    const updatedSubtasks = [...task.subtasks, newSubTask];
    // Re-evaluate main task done? If we add an unchecked subtask, main task becomes unchecked (unless it was already unchecked)
    const allDone = updatedSubtasks.every(st => st.done);

    updateTask({ ...task, subtasks: updatedSubtasks, done: allDone });
    setNewSubTaskTitles(prev => ({ ...prev, [taskId]: "" }));
  };

  const toggleSubTask = (taskId: string, subTaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map(st =>
      st.id === subTaskId ? { ...st, done: !st.done } : st
    );

    const allDone = updatedSubtasks.every(st => st.done);
    updateTask({ ...task, subtasks: updatedSubtasks, done: allDone });
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importJson);
      if (Array.isArray(parsed)) {
        // Basic validation/sanitization could go here
        // Ensure structure matches
        const validTasks = parsed.map((t: any) => ({
            id: t.id || crypto.randomUUID(),
            title: t.title || "Untitled",
            done: t.done || false,
            subtasks: Array.isArray(t.subtasks) ? t.subtasks.map((st: any) => ({
                id: st.id || crypto.randomUUID(),
                title: st.title || "Untitled",
                done: st.done || false
            })) : []
        }));
        setTasks(validTasks);
        setImportJson("");
        alert("Tasks imported successfully!");
      } else {
        alert("Invalid format: Expected an array of tasks.");
      }
    } catch (e) {
      alert("Invalid JSON");
    }
  };

  const handleShare = () => {
    const encoded = encodeTasks(tasks);
    // Use window.location.origin
    const url = `${window.location.origin}/view?data=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
        alert("Public link copied to clipboard!");
    });
  };

  // Stats
  const total = tasks.length;
  // Main tasks completed
  const completed = tasks.filter(t => t.done).length;
  const progress = total === 0 ? 0 : (completed / total) * 100;

  if (!isClient) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header & Stats */}
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">Fe-Accountability</h1>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Daily Progress</CardTitle>
              <CardDescription>{completed} of {total} high-level tasks completed</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="h-4" />
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex gap-2">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a new high-level task..."
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <Button onClick={addTask}>
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
        </div>

        {/* Task List */}
        <div className="space-y-4">
            {tasks.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    No tasks yet. Add one above or import JSON.
                </div>
            )}

            {tasks.map((task) => (
                <Card key={task.id} className="overflow-hidden">
                    <div className="flex items-center p-4 gap-3 bg-white">
                         <Checkbox
                            checked={task.done}
                            onCheckedChange={() => toggleTask(task)}
                            id={`task-${task.id}`}
                         />
                         <div className="flex-1 flex items-center justify-between">
                             <label
                                htmlFor={`task-${task.id}`}
                                className={`text-lg font-medium cursor-pointer ${task.done ? "line-through text-gray-400" : ""}`}
                             >
                                {task.title}
                             </label>
                             <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                             </Button>
                         </div>
                    </div>

                    {/* Subtasks Accordion */}
                    <div className="px-4">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="subtasks" className="border-b-0">
                                <AccordionTrigger className="text-sm text-gray-500 py-2 hover:no-underline">
                                    {task.subtasks.length > 0
                                        ? `${task.subtasks.filter(st => st.done).length}/${task.subtasks.length} Subtasks`
                                        : "Add Subtasks"}
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-2 pl-2 pb-4">
                                        {task.subtasks.map(st => (
                                            <div key={st.id} className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={st.done}
                                                    onCheckedChange={() => toggleSubTask(task.id, st.id)}
                                                    id={`subtask-${st.id}`}
                                                />
                                                <label
                                                    htmlFor={`subtask-${st.id}`}
                                                    className={`text-sm cursor-pointer ${st.done ? "line-through text-gray-400" : ""}`}
                                                >
                                                    {st.title}
                                                </label>
                                            </div>
                                        ))}

                                        {/* Add Subtask Input */}
                                        <div className="flex gap-2 mt-2 pt-2 border-t border-dashed">
                                            <Input
                                                className="h-8 text-sm"
                                                placeholder="New subtask..."
                                                value={newSubTaskTitles[task.id] || ""}
                                                onChange={(e) => setNewSubTaskTitles(prev => ({ ...prev, [task.id]: e.target.value }))}
                                                onKeyDown={(e) => e.key === "Enter" && addSubTask(task.id)}
                                            />
                                            <Button size="sm" variant="outline" onClick={() => addSubTask(task.id)}>
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </Card>
              ))}
        </div>

        {/* Footer Actions */}
        <div className="grid gap-4 md:grid-cols-2 pt-8 border-t">
            {/* Import */}
            <div>
                <h3 className="font-semibold mb-2">Import JSON</h3>
                <Textarea
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    placeholder='[{"title": "Task 1", "subtasks": [...]}]'
                    className="mb-2 font-mono text-xs"
                    rows={4}
                />
                <Button variant="outline" size="sm" onClick={handleImport}>Import</Button>
            </div>

            {/* Share */}
            <div className="flex flex-col justify-end items-end">
                <div className="text-right mb-2 text-sm text-gray-500">
                    Share your progress with friends via a public link.
                </div>
                <Button size="lg" className="w-full md:w-auto" onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" /> Share Dashboard
                </Button>
            </div>
        </div>

      </div>
    </div>
  );
}
