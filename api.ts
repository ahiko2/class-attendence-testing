const API_BASE_URL = 'http://localhost:3001/api';

export interface ClassData {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  class_id: string;
  name: string;
  avatar_url: string;
}

export interface AttendanceRecord {
  id: number;
  class_id: string;
  student_id: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Unmarked';
}

// Classes API
export const classesAPI = {
  getAll: async (): Promise<ClassData[]> => {
    const response = await fetch(`${API_BASE_URL}/classes`);
    return response.json();
  },

  getById: async (id: string): Promise<ClassData> => {
    const response = await fetch(`${API_BASE_URL}/classes/${id}`);
    return response.json();
  },

  create: async (classData: { id: string; name: string }): Promise<ClassData> => {
    const response = await fetch(`${API_BASE_URL}/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classData),
    });
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    await fetch(`${API_BASE_URL}/classes/${id}`, {
      method: 'DELETE',
    });
  },
};

// Students API
export const studentsAPI = {
  getByClass: async (classId: string): Promise<Student[]> => {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}/students`);
    return response.json();
  },

  create: async (classId: string, student: { id: string; name: string; avatarUrl: string }): Promise<Student> => {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
    return response.json();
  },

  delete: async (studentId: string): Promise<void> => {
    await fetch(`${API_BASE_URL}/students/${studentId}`, {
      method: 'DELETE',
    });
  },
};

// Attendance API
export const attendanceAPI = {
  getByClassAndDate: async (classId: string, date: string) => {
    const response = await fetch(`${API_BASE_URL}/attendance/${classId}/${date}`);
    return response.json();
  },

  getByClass: async (classId: string): Promise<{ attendance: AttendanceRecord[]; notes: any[] }> => {
    const response = await fetch(`${API_BASE_URL}/attendance/${classId}`);
    return response.json();
  },

  save: async (classId: string, date: string, data: { attendance: Record<string, string>; notes: string }): Promise<void> => {
    await fetch(`${API_BASE_URL}/attendance/${classId}/${date}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  clear: async (classId: string, date: string): Promise<void> => {
    await fetch(`${API_BASE_URL}/attendance/${classId}/${date}`, {
      method: 'DELETE',
    });
  },
};
