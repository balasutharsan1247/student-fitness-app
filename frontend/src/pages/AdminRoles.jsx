import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/api';
import Layout from '../components/Layout';
import {
  UserPlus,
  Edit3,
  Trash2,
  ShieldCheck,
  Users,
  Activity,
  Award,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const initialFormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'student',
  university: '',
  department: '',
  graduateType: '',
  year: '',
  dateOfBirth: '',
  age: '',
  gender: '',
  isActive: true,
};

const AdminRoles = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(initialFormState);
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [mentors, setMentors] = useState([]);
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [unassigningStudentId, setUnassigningStudentId] = useState('');

  const roles = ['student', 'mentor', 'admin'];
  const graduateTypes = ['Under-graduate', 'Post-graduate'];
  const years = ['I', 'II', 'III', 'IV'];
  const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
      loadMentors();
    } else {
      setLoading(false);
    }
  }, [user?.role]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getUsers();
      if (response.success) {
        setUsers(response.data);
      } else {
        setError(response.message || 'Unable to load users');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Unable to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadMentors = async () => {
    try {
      const response = await adminService.getMentors();
      if (response.success) {
        setMentors(response.data || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Unable to load mentors');
    }
  };

  const resetForm = () => {
    setForm(initialFormState);
    setEditingUser(null);
    setError('');
    setSuccess('');
    setShowForm(false);
  };

  const handleShowForm = () => {
    setForm(initialFormState);
    setEditingUser(null);
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.firstName || !form.lastName || !form.email) {
      setError('First name, last name and email are required.');
      return;
    }

    if (!editingUser && !form.password) {
      setError('Password is required when creating a new user.');
      return;
    }

    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.role,
        university: form.university,
        department: form.department,
        graduateType: form.graduateType,
        year: form.year,
        dateOfBirth: form.dateOfBirth || undefined,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender,
        isActive: form.isActive,
      };

      if (!editingUser) {
        payload.password = form.password;
      }

      const response = editingUser
        ? await adminService.updateUser(editingUser._id, payload)
        : await adminService.createUser(payload);

      if (response.success) {
        setSuccess(editingUser ? 'User updated successfully.' : 'User created successfully.');
        resetForm();
        await loadUsers();
      } else {
        setError(response.message || 'Unable to save user.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Unable to save user.');
    }
  };

  const handleEdit = (selectedUser) => {
    setEditingUser(selectedUser);
    setError('');
    setSuccess('');
    setShowForm(true);
    setForm({
      firstName: selectedUser.firstName,
      lastName: selectedUser.lastName,
      email: selectedUser.email,
      password: '',
      role: selectedUser.role,
      university: selectedUser.university || '',
      department: selectedUser.department || '',
      graduateType: selectedUser.graduateType || '',
      year: selectedUser.year || '',
      dateOfBirth: selectedUser.dateOfBirth ? selectedUser.dateOfBirth.split('T')[0] : '',
      age: selectedUser.age || '',
      gender: selectedUser.gender || '',
      isActive: selectedUser.isActive,
    });
  };

  const handleDelete = async (userId) => {
    const confirmation = window.confirm('Are you sure you want to delete this user? This action cannot be undone.');
    if (!confirmation) return;

    try {
      setError('');
      setSuccess('');
      const response = await adminService.deleteUser(userId);
      if (response.success) {
        setSuccess('User deleted successfully.');
        if (editingUser?._id === userId) {
          resetForm();
        }
        await loadUsers();
      } else {
        setError(response.message || 'Unable to delete user.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Unable to delete user.');
    }
  };

  const handleStudentSelection = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleAssignStudents = async () => {
    setError('');
    setSuccess('');

    if (!selectedMentorId) {
      setError('Please select a mentor.');
      return;
    }

    if (selectedStudentIds.length === 0) {
      setError('Please select at least one student to assign.');
      return;
    }

    try {
      setAssigning(true);
      const response = await adminService.assignStudents(selectedMentorId, selectedStudentIds);
      if (response.success) {
        setSuccess('Students assigned successfully.');
        setSelectedStudentIds([]);
        await Promise.all([loadUsers(), loadMentors()]);
      } else {
        setError(response.message || 'Unable to assign students.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Unable to assign students.');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassignStudent = async (mentorId, studentId) => {
    try {
      setError('');
      setSuccess('');
      setUnassigningStudentId(studentId);
      const response = await adminService.unassignStudent(mentorId, studentId);
      if (response.success) {
        setSuccess('Student unassigned successfully.');
        await Promise.all([loadUsers(), loadMentors()]);
      } else {
        setError(response.message || 'Unable to unassign student.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Unable to unassign student.');
    } finally {
      setUnassigningStudentId('');
    }
  };

  const filteredUsers = users.filter((account) => filterRole === 'all' || account.role === filterRole);
  const students = users.filter((account) => account.role === 'student');
  const selectedMentor = mentors.find((mentor) => mentor._id === selectedMentorId) || null;

  if (user?.role !== 'admin') {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center px-4 py-8">
          <div className="rounded-2xl p-8 bg-white dark:bg-dark-card shadow-sm border border-gray-200 dark:border-dark-border max-w-lg text-center">
            <ShieldCheck className="mx-auto mb-4 w-12 h-12 text-primary-600" />
            <h2 className="text-2xl font-semibold text-dark mb-2">Access Denied</h2>
            <p className="text-muted-dark">Only administrators can manage roles and user accounts.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-dark">Roles & User Management</h1>
                <p className="text-muted-dark mt-2 max-w-2xl">
                  Review and manage all administrators, mentors, and students from a single admin page.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 dark:bg-primary-900/20 px-4 py-2 text-sm font-medium text-primary-700 dark:text-primary-200">
                <Users className="w-5 h-5" />
                {users.length} accounts
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <button
              type="button"
              onClick={handleShowForm}
              className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>

          <div className="space-y-8">
            <section className="rounded-3xl bg-white dark:bg-dark-card shadow-sm border border-gray-100 dark:border-dark-border p-6">
              <div className="flex flex-col gap-2 mb-6">
                <h2 className="text-xl font-semibold text-dark">Assign Students to Mentor</h2>
                <p className="text-sm text-muted-dark">Select a mentor and one or more students, then assign them in one action.</p>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Mentor</label>
                  <select
                    value={selectedMentorId}
                    onChange={(e) => setSelectedMentorId(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  >
                    <option value="">Select mentor</option>
                    {mentors.map((mentor) => (
                      <option key={mentor._id} value={mentor._id}>
                        {mentor.firstName} {mentor.lastName} ({mentor.email}) - {mentor.assignedStudentsCount || 0} students
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-sm font-medium text-dark mb-2">Students</p>
                  <div className="max-h-64 overflow-y-auto rounded-2xl border border-gray-200 p-3 space-y-2">
                    {students.length === 0 ? (
                      <p className="text-sm text-muted-dark">No students available.</p>
                    ) : (
                      students.map((student) => (
                        <label key={student._id} className="flex items-center gap-2 text-sm text-dark">
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.includes(student._id)}
                            onChange={() => handleStudentSelection(student._id)}
                          />
                          <span>
                            {student.firstName} {student.lastName} ({student.email})
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleAssignStudents}
                  disabled={assigning}
                  className="inline-flex items-center justify-center rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {assigning ? 'Assigning...' : 'Assign Students'}
                </button>
              </div>

              {selectedMentor && (
                <div className="mt-6 rounded-2xl border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-dark mb-3">
                    Assigned Students ({selectedMentor.assignedStudents?.length || 0})
                  </h3>
                  {selectedMentor.assignedStudents?.length ? (
                    <div className="space-y-2">
                      {selectedMentor.assignedStudents.map((student) => (
                        <div key={student._id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2">
                          <div className="text-sm text-dark">
                            {student.firstName} {student.lastName} ({student.email})
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUnassignStudent(selectedMentor._id, student._id)}
                            disabled={unassigningStudentId === student._id}
                            className="inline-flex items-center justify-center rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {unassigningStudentId === student._id ? 'Removing...' : 'Remove'}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-dark">No students assigned to this mentor yet.</p>
                  )}
                </div>
              )}
            </section>

            {(showForm || editingUser) && (
              <section className="rounded-3xl bg-white dark:bg-dark-card shadow-sm border border-gray-100 dark:border-dark-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-dark">{editingUser ? 'Edit User' : 'Create User'}</h2>
                    <p className="text-sm text-muted-dark mt-1">Add or update a user account with role-level access.</p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {editingUser ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <UserPlus className="w-5 h-5 text-primary-500" />
                    )}
                  </div>
                </div>

                {error && <div className="mb-4 rounded-2xl bg-green- text-green- px-4 py-3 text-sm">{error}</div>}
                {success && <div className="mb-4 rounded-2xl bg-green-50 text-green-700 px-4 py-3 text-sm">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-medium text-dark">First Name</span>
                      <input
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-dark">Last Name</span>
                      <input
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        required
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-sm font-medium text-dark">Email</span>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      required
                    />
                  </label>

                  {!editingUser && (
                    <label className="block">
                      <span className="text-sm font-medium text-dark">Password</span>
                      <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        required
                      />
                    </label>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-medium text-dark">Role</span>
                      <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      >
                        {roles.map((roleOption) => (
                          <option key={roleOption} value={roleOption}>
                            {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-dark">Status</span>
                      <div className="mt-2 inline-flex items-center gap-3">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name="isActive"
                            value={true}
                            checked={form.isActive === true}
                            onChange={() => setForm((prev) => ({ ...prev, isActive: true }))}
                          />
                          Active
                        </label>
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name="isActive"
                            value={false}
                            checked={form.isActive === false}
                            onChange={() => setForm((prev) => ({ ...prev, isActive: false }))}
                          />
                          Inactive
                        </label>
                      </div>
                    </label>
                  </div>

                  {form.role === 'student' && (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                          <span className="text-sm font-medium text-dark">University</span>
                          <input
                            name="university"
                            value={form.university}
                            onChange={handleChange}
                            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-medium text-dark">Department</span>
                          <input
                            name="department"
                            value={form.department}
                            onChange={handleChange}
                            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                          />
                        </label>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                          <span className="text-sm font-medium text-dark">Graduate Type</span>
                          <select
                            name="graduateType"
                            value={form.graduateType}
                            onChange={handleChange}
                            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                          >
                            <option value="">Select type</option>
                            {graduateTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block">
                          <span className="text-sm font-medium text-dark">Year</span>
                          <select
                            name="year"
                            value={form.year}
                            onChange={handleChange}
                            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                          >
                            <option value="">Select year</option>
                            {years.map((yearOption) => (
                              <option key={yearOption} value={yearOption}>
                                {yearOption}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                          <span className="text-sm font-medium text-dark">Date of Birth</span>
                          <input
                            name="dateOfBirth"
                            type="date"
                            value={form.dateOfBirth}
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]}
                            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-medium text-dark">Age</span>
                          <input
                            name="age"
                            type="number"
                            min="16"
                            max="100"
                            value={form.age}
                            onChange={handleChange}
                            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                          />
                        </label>
                      </div>

                      <label className="block">
                        <span className="text-sm font-medium text-dark">Gender</span>
                        <select
                          name="gender"
                          value={form.gender}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        >
                          <option value="">Select gender</option>
                          {genders.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                    >
                      {editingUser ? 'Update User' : 'Create User'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      Reset Form
                    </button>
                  </div>
                </form>
              </section>
            )}
            <div className="inline-flex items-center gap-3">
              <label className="text-sm font-medium text-muted-dark">Role filter:</label>
              <select
                name="filterRole"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              >
                <option value="all">All Roles</option>
                {roles.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <section className="rounded-3xl bg-white dark:bg-dark-card shadow-sm border border-gray-100 dark:border-dark-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-dark">Account Directory</h2>
                  <p className="text-sm text-muted-dark mt-1">View all roles and perform edit or delete actions.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-200">
                  <Activity className="w-4 h-4 text-green-600" />
                  Live updates
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary-500"></div>
                  <p className="text-muted-dark">Loading users...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-gray-600 dark:text-gray-300">
                    <thead className="border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="px-4 py-3 font-medium text-gray-500">Name</th>
                        <th className="px-4 py-3 font-medium text-gray-500">Email</th>
                        <th className="px-4 py-3 font-medium text-gray-500">Role</th>
                        <th className="px-4 py-3 font-medium text-gray-500">Account ID</th>
                        <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                        {(filterRole === 'all' || filterRole === 'student') && (
                          <>
                            <th className="px-4 py-3 font-medium text-gray-500">
                              <span className="inline-flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-green-" />
                                Points
                              </span>
                            </th>
                            <th className="px-4 py-3 font-medium text-gray-500">
                              <span className="inline-flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-primary-500" />
                                Level
                              </span>
                            </th>
                          </>
                        )}
                        <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td
                            colSpan={filterRole === 'all' || filterRole === 'student' ? 8 : 6}
                            className="px-4 py-8 text-center text-muted-dark"
                          >
                            No accounts available for the selected role.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((account) => (
                          <tr key={account._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                            <td className="px-4 py-4 font-medium text-dark">{account.firstName} {account.lastName}</td>
                            <td className="px-4 py-4">{account.email}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                                account.role === 'admin'
                                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                                  : account.role === 'mentor'
                                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                              }`}>
                                {account.role}
                              </span>
                            </td>
                            <td className="px-4 py-4 font-mono text-[0.94rem] text-slate-600 dark:text-slate-300">{account.accountId || '—'}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${account.isActive ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-green- text-green- dark:bg-green-/20 dark:text-green-'}`}>
                                {account.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            {(filterRole === 'all' || filterRole === 'student') && (
                              <>
                                <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                                  {account.role === 'student' ? (
                                    <span className="inline-flex items-center gap-1 font-semibold text-green- dark:text-green-">
                                      <Award className="w-3.5 h-3.5" />
                                      {account.points ?? 0}
                                    </span>
                                  ) : '—'}
                                </td>
                                <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                                  {account.role === 'student' ? (
                                    <span className="inline-flex items-center gap-1 font-semibold text-primary-600 dark:text-primary-400">
                                      <ShieldCheck className="w-3.5 h-3.5" />
                                      {account.level ?? 1}
                                    </span>
                                  ) : '—'}
                                </td>
                              </>
                            )}
                            <td className="px-4 py-4 space-x-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(account)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 transition hover:bg-green-100"
                                aria-label="Edit user"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(account._id)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-800"
                                aria-label="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default AdminRoles;
