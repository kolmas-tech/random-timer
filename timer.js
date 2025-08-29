window.addEventListener("load",()=>{
    var settings;
    const saveSettings=()=>{
        localStorage.setItem("settings",JSON.stringify(settings));
    };
    if(!(settings=JSON.parse(localStorage.getItem("settings")))){
        settings={
            randomStep:10,
            minDuration:30,
            maxDuration:90,
            timeTextStyle:"min_sec"
        }
        saveSettings();
    }
    const alarmSound=new Audio("sounds/alarm.mp3");
    alarmSound.volume=1.0;
    alarmSound.loop=true;
    const buttonSound=new Audio("sounds/button.mp3");
    buttonSound.volume=0.4;
    const settingsButton=document.getElementById("settingsButton")
    const settingsDialog=document.getElementById("settingsDialog");
    const randomStepInput=document.getElementById("randomStepInput");
    const minDurationInput=document.getElementById("minDurationInput");
    const maxDurationInput=document.getElementById("maxDurationInput");
    const timeTextStyleSelect=document.getElementById("timeTextStyleSelect");
    randomStepInput.value=settings.randomStep;
    minDurationInput.value=settings.minDuration;
    minDurationInput.min=settings.randomStep;
    minDurationInput.step=settings.randomStep;
    maxDurationInput.value=settings.maxDuration;
    maxDurationInput.step=settings.randomStep;
    timeTextStyleSelect.value=settings.timeTextStyle;
    settingsButton.addEventListener("click",()=>{
        buttonSound.play();
        settingsDialog.showModal();
    });
    settingsDialog.addEventListener("close",()=>{
        saveSettings();
        showTimer();
    })
    randomStepInput.addEventListener("change",e=>{
        const newValue=Number(e.target.value);
        if(Number.isNaN(newValue) || newValue<1){
            settings.randomStep=1;
        }else if(newValue>600){
            settings.randomStep=600;
        }else{
            settings.randomStep=Math.floor(newValue);
        }
        e.target.value=settings.randomStep;
        settings.minDuration=Math.ceil(settings.minDuration/settings.randomStep)*settings.randomStep;
        minDurationInput.value=settings.minDuration;
        minDurationInput.min=settings.randomStep;
        minDurationInput.step=settings.randomStep;
        settings.maxDuration=Math.ceil(settings.maxDuration/settings.randomStep)*settings.randomStep;
        if(settings.maxDuration<settings.minDuration){
            settings.maxDuration=settings.minDuration;
        }
        maxDurationInput.value=settings.maxDuration;
        maxDurationInput.step=settings.randomStep;
    });
    minDurationInput.addEventListener("change",e=>{
        const newValue=Number(e.target.value);
        if(Number.isNaN(newValue) || newValue<settings.randomStep){
            settings.minDuration=settings.randomStep;
        }else{
            settings.minDuration=Math.ceil(newValue/settings.randomStep)*settings.randomStep;
            if(settings.maxDuration<settings.minDuration){
                settings.maxDuration=settings.minDuration;
            }
            maxDurationInput.value=settings.maxDuration;
        }
        e.target.value=settings.minDuration;
    });
    maxDurationInput.addEventListener("change",e=>{
        const newValue=Number(e.target.value);
        if(Number.isNaN(newValue) || newValue<settings.minDuration){
            settings.maxDuration=settings.minDuration;
        }else{
            settings.maxDuration=Math.ceil(newValue/settings.randomStep)*settings.randomStep;
        }
        e.target.value=settings.maxDuration;
    });
    timeTextStyleSelect.addEventListener("change",e=>{
        settings.timeTextStyle=e.target.value;
    });
    const remainingTimeTextElement=document.getElementById("remainingTimeText");
    const remainingTimeBarElement=document.getElementById("remainingTimeBar");
    const remainingTimeBarVariableElement=document.getElementById("remainingTimeBarVariable");
    var remainingTime=0;
    var duration=settings.maxDuration;
    var intervalId;
    const showTimer=()=>{
        const remainingSeconds=Math.ceil(remainingTime);
        if(settings.timeTextStyle=="min_sec"){
            remainingTimeTextElement.innerText=`${String(Math.floor(remainingSeconds/60)).padStart(2,"0")}:${String(remainingSeconds%60).padStart(2,"0")}`;
        }else{
            remainingTimeTextElement.innerText=remainingSeconds;
        }
        remainingTimeBarVariableElement.style.marginLeft=100*remainingTime/duration+"%";
    }
    showTimer();
    const playButton=document.getElementById("playButton");
    const pauseButton=document.getElementById("pauseButton");
    const stopButton=document.getElementById("stopButton");
    pauseButton.disabled=true;
    stopButton.disabled=true;
    playButton.addEventListener("click",()=>{
        buttonSound.play();
        const resumeTimer=()=>{
            intervalId=setInterval(()=>{
                remainingTime-=0.1;
                if(remainingTime<0){
                    clearInterval(intervalId);
                    remainingTime=0;
                    pauseButton.disabled=true;
                    alarmSound.play();
                }
                showTimer();
            },100);
            remainingTimeBarElement.classList.add("running");
        };
        if(remainingTime==0){
            const setupTimer=n=>{
                remainingTime=duration=Math.floor(Math.random()*((settings.maxDuration-settings.minDuration)/settings.randomStep+1))*settings.randomStep+settings.minDuration;
                showTimer();
                if(n!=0){
                    setTimeout(setupTimer,50,n-1);
                }else{
                    alarmSound.play();
                    setTimeout(()=>{
                        alarmSound.pause();
                        alarmSound.currentTime=0;
                    },1000);
                    setTimeout(()=>{
                        resumeTimer();
                        pauseButton.disabled=false;
                        stopButton.disabled=false;    
                    },2000);
                }
            };
            setupTimer(40);
        }else{
            resumeTimer();
            pauseButton.disabled=false;
        }
        playButton.disabled=true;
        settingsButton.disabled=true;
    });
    pauseButton.addEventListener("click",()=>{
        buttonSound.play();
        clearInterval(intervalId);
        playButton.disabled=false;
        pauseButton.disabled=true;
        remainingTimeBarElement.classList.remove("running");
    });
    stopButton.addEventListener("click",()=>{
        buttonSound.play();
        clearInterval(intervalId);
        remainingTime=0;
        showTimer();
        alarmSound.pause();
        alarmSound.currentTime=0;
        playButton.disabled=false;
        pauseButton.disabled=true;
        stopButton.disabled=true;
        settingsButton.disabled=false;
        remainingTimeBarElement.classList.remove("running");
    });
});
