'use client';

import { useState } from 'react';
import { Select } from '@/components/ui/select';

interface Project {
  id: string;
  name: string;
}

interface ProjectSelectorProps {
  projects: Project[];
  defaultProjectId: string;
}

export default function ProjectSelector({ projects, defaultProjectId }: ProjectSelectorProps) {
  const [selectedProject, setSelectedProject] = useState(defaultProjectId);

  const handleProjectChange = (value: string) => {
    setSelectedProject(value);
    // You can add logic here to update the project context or make API calls
    console.log('Selected project:', value);
  };

  if (projects.length <= 1) {
    return null; // Don't show selector if only one project
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">Project:</label>
      <Select
        value={selectedProject}
        onValueChange={handleProjectChange}
      >
        <option value="">Select a project</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
