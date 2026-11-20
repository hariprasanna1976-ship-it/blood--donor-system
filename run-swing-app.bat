@echo off
title Agentic AI Blood Coordination System - Java Swing (JFrame)
echo Starting Agentic AI Blood Coordination System (Java JFrame)...
start javaw -jar "java-swing\AgenticBloodSystem.jar"
if %ERRORLEVEL% NEQ 0 (
    echo Attempting direct java command...
    java -jar "java-swing\AgenticBloodSystem.jar"
)
