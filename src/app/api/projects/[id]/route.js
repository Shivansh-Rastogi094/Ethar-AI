import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: { select: { id: true, name: true, email: true, role: true } },
        owner: { select: { name: true } }
      }
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    if (session.user.role !== 'ADMIN') {
      const isMember = project.members.some(m => m.id === session.user.id);
      if (!isMember) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error('Fetch Project Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 });
    }

    const projectId = params.id;

    // Prisma relation handles cascading deletes if configured, 
    // but typically we should delete tasks first or rely on cascade.
    // Let's explicitly delete tasks first for safety.
    await prisma.task.deleteMany({
      where: { projectId }
    });

    await prisma.project.delete({
      where: { id: projectId }
    });

    return NextResponse.json({ message: 'Project deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete Project Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
