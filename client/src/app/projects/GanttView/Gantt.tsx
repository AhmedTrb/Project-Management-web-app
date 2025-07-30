
import { useState, useCallback } from "react"
import { Gantt, type Task as GanttTask, ViewMode } from "gantt-task-react"
import "gantt-task-react/dist/index.css";
import { Task as ProjectTask } from '@/app/types/types';
import { useGetProjectDependenciesQuery, useGetProjectTasksQuery } from '@/state/api';
import Loader from '@/components/Loader/Loader';
import { getHexFromTailwindColor } from '@/app/utils/tailwindColors';
import { useRescheduleTaskMutation } from '@/state/api';
interface Props {
  id: string
  projectTasks?: ProjectTask[]
}

const getStylesForStatus = (
  status: string | undefined,
  isSelected = false,
): {
  backgroundColor: string
  progressColor: string
  progressSelectedColor: string
} => {
  switch (status) {
    case "To Do":
      return {
        backgroundColor: "red-400",
        progressColor: "red-400",
        progressSelectedColor: "red-400",
      }
    case "In Progress":
      return {
        backgroundColor: "primary-500",
        progressColor: "primary-500",
        progressSelectedColor: "primary-500",
      }
    case "Under Review":
      return {
        backgroundColor: "yellow-500",
        progressColor: "yellow-500",
        progressSelectedColor: "yellow-500",
      }
    case "Done":
      return {
        backgroundColor: "green-700",
        progressColor: "green-700",
        progressSelectedColor: "green-800",
      }
    default:
      return {
        backgroundColor: "red-100",
        progressColor: "red-500",
        progressSelectedColor: "red-600",
      }
  }
}

const getProgressByStatus = (status: ProjectTask["status"] | undefined): number => {
  switch (status) {
    case "To Do":
      return 0
    case "In Progress":
      return 50
    case "Under Review":
      return 80
    case "Done":
      return 100
    default:
      return 0
  }
}

export default function GanttChart({ id, projectTasks }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);
  const [rescheduleTask, { isLoading: isRescheduling, error: rescheduleError }] = useRescheduleTaskMutation();
  const { data: projectDependencies } = useGetProjectDependenciesQuery({ projectId: id }, { skip: !id })

  const sortedTasks = [...(projectTasks || [])].sort((a, b) => (a.degree ?? 0) - (b.degree ?? 0))

  const ganttTasks: GanttTask[] = sortedTasks.map((task) => {
    const isSelected = selectedId === String(task.id)
    const { backgroundColor, progressColor, progressSelectedColor } = getStylesForStatus(task.status, isSelected)

    const startDate = task.startDate ? new Date(task.startDate) : new Date(task.createdAt)
    const endDate = task.dueDate
      ? new Date(task.dueDate)
      : new Date(startDate.getTime() + (task.duration || 1) * 24 * 60 * 60 * 1000)

    // Get hex color values from Tailwind color names
    const bgHex = getHexFromTailwindColor(isSelected ? progressSelectedColor : backgroundColor)
    const progressHex = getHexFromTailwindColor(isSelected ? progressSelectedColor : progressColor)
    const progressSelectedHex = getHexFromTailwindColor(progressSelectedColor)

    return {
      start: startDate,
      end: endDate,
      name: task.title,
      id: String(task.id),
      type: "task",
      progress: getProgressByStatus(task.status),
      isDisabled: false,
      dependencies: projectDependencies
        ?.filter((dep) => dep.dependentTaskId === task.id)
        ?.map((dep) => String(dep.prerequisiteTaskId)) || [],
      styles: {
        backgroundColor: bgHex,
        progressColor: progressHex,
        progressSelectedColor: progressSelectedHex,
      },
    }
  })


  const handleTaskDateChange = useCallback(
    (task: GanttTask, _children: GanttTask[]) => {
      // fire the RTK‑Query mutation on the one moved task
      rescheduleTask({
        projectId: id,
        taskId: task.id,
        newStartDate: task.start.toISOString(),
        newDueDate:   task.end.toISOString(),
      })
    },
    [rescheduleTask,id]
  )

  const handleTaskSelect = useCallback((task: GanttTask, isSelected: boolean) => {
    setSelectedId(isSelected ? task.id : null)
  }, [])

  if (!projectTasks) return <Loader />

  return (
    <div className="w-full h-full bg-white">
      {/* View Mode Controls */}
      <div className="flex gap-2 p-4 border-b border-gray-200">
        {["Hour", "Day", "Week", "Month"].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(ViewMode[mode as keyof typeof ViewMode])}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              viewMode === ViewMode[mode as keyof typeof ViewMode]
                ? "bg-primary-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Gantt Chart */}
      <div className="flex-1 w-full">
        <Gantt
          tasks={ganttTasks}
          viewMode={viewMode}
          onDateChange={handleTaskDateChange}
          onSelect={handleTaskSelect}
          onExpanderClick={() => {}}
          listCellWidth="140px"
          columnWidth={viewMode === ViewMode.Month ? 300 : viewMode === ViewMode.Week ? 250 : 65}
          rowHeight={50}
          barCornerRadius={4}
          handleWidth={8}
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="14px"
          arrowColor={getHexFromTailwindColor("secondary-900")}
          arrowIndent={20}
          todayColor={getHexFromTailwindColor("primary-600")}
          TooltipContent={({ task, fontSize, fontFamily }) => (
            <div
              className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-xs"
              style={{ fontSize, fontFamily }}
            >
              <div className="font-semibold text-gray-900 mb-2">{task.name}</div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Start: {task.start.toLocaleDateString()}</div>
                <div>End: {task.end.toLocaleDateString()}</div>
                <div>Progress: {task.progress}%</div>
                {task.dependencies && task.dependencies.length > 0 && (
                  <div>Dependencies: {task.dependencies.join(", ")}</div>
                )}
              </div>
            </div>
          )}
        />
      </div>

      {/* Status Legend */}
      <div className="flex gap-4 p-4 border-t border-gray-200 bg-gray-50">
        {[
          { label: "To Do", color: "red-400" },
          { label: "In Progress", color: "primary-500" },
          { label: "Under Review", color: "yellow-400" },
          { label: "Done", color: "green-500" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded bg-${color}`} />
            <span className="text-sm text-gray-700">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}