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

    const resolvedParams = await params;
    const taskId = resolvedParams?.id;
    const { status } = await request.json();

    if (!taskId) {
      return NextResponse.json({ message: 'Task ID is missing' }, { status: 400 });
    }

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
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 });
    }

    const resolvedParams = await params;
    const taskId = resolvedParams?.id;

    if (!taskId) {
      return NextResponse.json({ message: 'Task ID is missing' }, { status: 400 });
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete Task Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
