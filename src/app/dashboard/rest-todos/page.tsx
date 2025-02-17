import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

import { getUserSessionServer } from "@/auth/actions/auth-actions";
import { NewTodo, TodosGrid } from "@/todos";

export const metadata = {
  title: 'Listado de Todos',
  description: 'SEO Title',
};


export default async function RestTodosPage() {

  // const todos = await prisma.todo.findMany({ orderBy: { description: 'asc' } });

  const user = await getUserSessionServer();
  if (!user) redirect('/api/auth/signin');

  const todos = await prisma.todo.findMany({
    where: { userId: user.id },
    orderBy: { description: 'asc' }
  });


  return (
    <div>
      <div className="w-full px-3 mx-5 mb-5">
        <NewTodo />
      </div>

      <TodosGrid todos={todos} />
    </div>
  );
}