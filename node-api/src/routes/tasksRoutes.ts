/* Gerencia as rotas relacionadas às tarefas */
import { Router, Request, Response } from "express";
import { TasksRepository } from "../repositories/tasksRepository";

const router = Router();
const tasksRepository = new TasksRepository();

// POST: Cria uma tarefa e solicita resumo ao serviço Python
router.post("/", async (req: Request, res: Response) => {
  try {
    const { text, lang } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Campo "text" é obrigatório.' });
    } else if (lang !== "en" && lang !== "pt" && lang !== "es") {
      return res.status(400).json({ error: 'Language not supported.' });
    }

    // Cria a "tarefa"
    const task = tasksRepository.createTask(text, lang);

    // Deve solicitar o resumo do texto ao serviço Python
    const { spawn } = require('child_process');
    const pyprocess = spawn('python', ['teste_dev/python-llm/app/main.py', text, lang]);

    let summary = '';
    pyprocess.stdout.on('data', (data: any) => {
      summary += data.toString();
    });

    pyprocess.stderr.on('data', (data: any) => {
      console.error(`stderr: ${data}`);
    });

    pyprocess.on('close', (code: number) => {
      if (code !== 0) {
        console.error(`Processo Python finalizado com código ${code}`);
        return res.status(500).json({ error: "Erro ao gerar resumo com o serviço Python." });
      }

    // Atualiza a tarefa com o resumo
    tasksRepository.updateTask(task.id, summary);

    return res.status(201).json({
      message: "Tarefa criada com sucesso!",
      task: tasksRepository.getTaskById(task.id),
    });
  });
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    return res
      .status(500)
      .json({ error: "Ocorreu um erro ao criar a tarefa." });
  }
});

// GET: Lista todas as tarefas
router.get("/", async (req, res) => {
  const tasks = tasksRepository.getAllTasks();
  return res.json(tasks);
});


// GET: Acesso ao resumo de uma tarefa
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const task = tasksRepository.getTaskById(Number(id));
  if (!task) {
    return res.status(404).json({ error: "Tarefa não encontrada." });
  }
  return res.json(task);
});

// DELETE: Remove uma tarefa
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const task = tasksRepository.getTaskById(Number(id));
  if (!task) {
    return res.status(404).json({ error: "Tarefa não encontrada." });
  }
  tasksRepository.deleteTask(Number(id));
  return res.json({ message: "Tarefa removida com sucesso." });
});

export default router;
