import AttendanceForm from '@/components/attendance/attendance-form';
import PageHeader from '@/components/shared/page-header';

export default function AttendancePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Record Attendance"
        description="Keep track of participation in your educational activities."
      />
      <AttendanceForm />
    </div>
  );
}
