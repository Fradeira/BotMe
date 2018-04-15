<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class DefaultController extends Controller
{
    /**
     * @Route("/", name="homepage")
     */
    public function indexAction(Request $request)
    {
        return $this->render('front/homepage.html.twig', [
            'base_dir' => realpath($this->getParameter('kernel.project_dir')).DIRECTORY_SEPARATOR,
        ]);
    }

    /**
     * @Route("/basicConsole", name="basicConsole")
     */
    public function basicConsoleAction(Request $request)
    {
        return $this->render('front/botConsole/basicConsole.html.twig', [
            'base_dir' => realpath($this->getParameter('kernel.project_dir')).DIRECTORY_SEPARATOR,
        ]);
    }

    /**
     * @Route("/dashboard_v_mlp", name="dashboard_v_mlp")
     */
    public function dashboard_v_mlpAction(Request $request)
    {
        return $this->render('front/version_mlp/dashboard_v_mlp.html.twig', [
            'base_dir' => realpath($this->getParameter('kernel.project_dir')).DIRECTORY_SEPARATOR,
        ]);
    }

    /**
     * @Route("/v_mlp", name="v_mlp")
     */
    public function v_mlpAction(Request $request)
    {
        return $this->render('front/version_mlp/v_mlp.html.twig', [
            'base_dir' => realpath($this->getParameter('kernel.project_dir')).DIRECTORY_SEPARATOR,
        ]);
    }
}
