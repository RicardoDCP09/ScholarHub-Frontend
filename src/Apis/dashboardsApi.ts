import api from '../utils/axiosInstance';

export async function getAdminDashboard() {
	const res = await api.get('/dashboard/admin');
	return res.data;
}

export async function getTeacherDashboard(teacherId: number) {
	const res = await api.get(`/dashboard/teacher/${teacherId}`);
	return res.data;
}

export async function getStudentDashboard(studentId: number) {
	const res = await api.get(`/dashboard/student/${studentId}`);
	return res.data;
}

export default {
	getAdminDashboard,
	getTeacherDashboard,
	getStudentDashboard
};
