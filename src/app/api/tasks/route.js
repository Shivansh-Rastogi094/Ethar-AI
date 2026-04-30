import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    let whereClause = {};

    if (projectId) {
      whereClause.projectId = projectId;
      // Member must be part of the project to view tasks (unless admin)
      if (session.user.role !== 'ADMIN') {
        const project = await prisma.project.findUnique({
          where: { id: projectId },
          include: { members: true }
        });
        if (!project || !project.members.some(m => m.id === session.user.id)) {
          return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }
      }
    } else if (session.user.role !== 'ADMIN') {
      // Member sees their assigned tasks across projects
      whereClause.assigneeId = session.user.id;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error('Fetch Tasks Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 });
    }

    const { title, description, projectId, assigneeId, dueDate } = await request.json();

    if (!title || !projectId) {
      return NextResponse.json({ message: 'Title and projectId are required' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Create Task Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
