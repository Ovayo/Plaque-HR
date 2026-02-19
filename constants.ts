
import { Employee } from './types';

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'EMP001',
    name: 'Sarah Jenkins',
    email: 's.jenkins@pakque.hr',
    phone: '+1 (555) 123-4567',
    role: 'Senior Developer',
    department: 'Engineering',
    hireDate: '2022-03-15',
    emergencyContact: {
      name: 'Robert Jenkins',
      phone: '+1 (555) 987-6543',
      relationship: 'Spouse'
    },
    hourlyRate: 65,
    avatar: 'https://picsum.photos/seed/sarah/100/100',
    isActive: true
  },
  {
    id: 'EMP002',
    name: 'Michael Chen',
    email: 'm.chen@pakque.hr',
    phone: '+1 (555) 234-5678',
    role: 'HR Manager',
    department: 'People & Culture',
    hireDate: '2021-11-01',
    emergencyContact: {
      name: 'Alice Chen',
      phone: '+1 (555) 876-5432',
      relationship: 'Sister'
    },
    hourlyRate: 55,
    avatar: 'https://picsum.photos/seed/michael/100/100',
    isActive: true
  },
  {
    id: 'EMP003',
    name: 'Jessica Williams',
    email: 'j.williams@pakque.hr',
    phone: '+1 (555) 345-6789',
    role: 'Product Designer',
    department: 'Design',
    hireDate: '2023-01-20',
    emergencyContact: {
      name: 'Tom Williams',
      phone: '+1 (555) 765-4321',
      relationship: 'Father'
    },
    hourlyRate: 60,
    avatar: 'https://picsum.photos/seed/jessica/100/100',
    isActive: true
  }
];

export const DEPARTMENTS = ['Engineering', 'People & Culture', 'Design', 'Sales', 'Marketing', 'Finance'];
