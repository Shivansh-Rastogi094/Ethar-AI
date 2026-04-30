import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const taskId = params.id;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ message: 'Status is required' }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: { include: { members: true } }
      }
    });

    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    if (session.user.role !== 'ADMIN') {
      const isMember = task.project.members.some(m => m.id === session.user.id);
      if (!isMember) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status }
    });

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error('Update Task Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    // Only Admins can delete tasks
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 });
    }

    const taskId = params.id;

    await prisma.task.delete({
      where: { id: taskId }
    });

    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete Task Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
