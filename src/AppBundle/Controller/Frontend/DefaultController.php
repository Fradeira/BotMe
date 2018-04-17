<?php

namespace AppBundle\Controller\Frontend;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class DefaultController extends Controller
{
    /**
     * @Route("/", name="index")
     */
    public function indexAction(Request $request)
    {
        return $this->render('front/index.html.twig', [
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
<<<<<<< HEAD:src/AppBundle/Controller/DefaultController.php
     * @Route("/creation_bot", name="creation_bot")
     */
    public function creation_botAction(Request $request)
    {
        return $this->render('interface/creation_bot.html.twig', [
            'base_dir' => realpath($this->getParameter('kernel.project_dir')).DIRECTORY_SEPARATOR,
        ]);
    }

    /**
     * @Route("/analyze", name="analyze")
     */
    public function analyzeAction(Request $request)
    {
        return $this->render('interface/analyze.html.twig', [
=======
     * @Route("/homepage_bot", name="homepage_bot")
     */
    public function homepage_botAction(Request $request)
    {
        return $this->render('interface/views/homepage_bot.html.twig', [
>>>>>>> 317a9dd68b3e455dc8ea2bc38b2926f11f641e3b:src/AppBundle/Controller/Frontend/DefaultController.php
            'base_dir' => realpath($this->getParameter('kernel.project_dir')).DIRECTORY_SEPARATOR,
        ]);
    }
}
