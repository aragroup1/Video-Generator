'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  _count: {
    products: number;
    videos: number;
    videoJobs: number;
  };
}

interface ProjectSelectorProps {
  projects: Project[];
}

export default function ProjectSelector({ projects }: ProjectSelectorProps) {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('current-project', projectId);
    }
    router.refresh();
  };

  return (
    <div className="flex items-center space-x-2">
      <Select
        value={selectedProject}
        onChange={(e) => handleProjectChange(e.target.value)}
        className="min-w-[200px]"
      >
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name} ({project._count.products} products)
          </option>
        ))}
      </Select>
      <Button
        onClick={() => router.push('/dashboard/projects/new')}
        size="icon"
      >
        <Plus size={16} />
      </Button>
    </div>
  );
}
