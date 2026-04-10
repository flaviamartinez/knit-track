import { supabase } from '../supabase';
import { Project } from '../types';

export const projectService = {
  subscribeToProjects: (userId: string, callback: (projects: Project[]) => void) => {
    // Initial fetch for optimistic UI
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        return;
      }
      
      const formattedData = data?.map(doc => ({
        id: doc.id,
        name: doc.name,
        description: doc.description,
        userId: doc.user_id,
        status: doc.status,
        currentRow: doc.current_row,
        sections: doc.sections,
        patternUrl: doc.pattern_url,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at,
      })) as Project[];
      
      callback(formattedData || []);
    };
    
    fetchProjects();

    // Polling interval to emulate realtime snapshot behavior simply
    const intervalId = setInterval(fetchProjects, 2000);
    return () => clearInterval(intervalId);
  },

  createProject: async (userId: string, project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const now = Date.now();
    const newProject = {
      name: project.name,
      description: project.description || null,
      user_id: userId,
      status: 'active',
      current_row: 0,
      sections: project.sections || [],
      pattern_url: project.patternUrl,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('projects')
      .insert(newProject)
      .select('id')
      .single();
      
    if (error) {
      console.error('Error creating project:', error);
      throw error;
    }
    return data.id;
  },

  updateProject: async (projectId: string, updates: Partial<Project>) => {
    const mappedUpdates: any = {
      updated_at: Date.now()
    };
    
    if (updates.name !== undefined) mappedUpdates.name = updates.name;
    if (updates.description !== undefined) mappedUpdates.description = updates.description;
    if (updates.status !== undefined) mappedUpdates.status = updates.status;
    if (updates.currentRow !== undefined) mappedUpdates.current_row = updates.currentRow;
    if (updates.sections !== undefined) mappedUpdates.sections = updates.sections;
    if (updates.patternUrl !== undefined) mappedUpdates.pattern_url = updates.patternUrl;

    const { error } = await supabase
      .from('projects')
      .update(mappedUpdates)
      .eq('id', projectId);
      
    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  deleteProject: async (projectId: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
      
    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  uploadPattern: async (file: File, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('patterns')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading pattern:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage.from('patterns').getPublicUrl(fileName);
    return data.publicUrl;
  }
};
