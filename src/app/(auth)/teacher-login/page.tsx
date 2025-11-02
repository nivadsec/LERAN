import { redirect } from 'next/navigation';

export default function TeacherLoginPage() {
  redirect('/auth/admin/login');
}
