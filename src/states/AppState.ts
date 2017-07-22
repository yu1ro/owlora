import Task from '../models/Task';
import Project from '../models/Project';

export interface AppState {
    tasks: Task[];
    projects: Project[];
    isTaskLoading: boolean;
}
