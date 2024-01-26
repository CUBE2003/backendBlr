
const Skill =require('../models/skills');
const Agent=require('../models/agent');


addSkills: async(req, res)=>{
    const newSkills = new Skills({userId: req.user.id, skill: req.body.skill});
    try{
        await newSkill. save();
        await User.findByIdAndUpdate(req.user.id, {Sset: {skills: true}})
        res. status (200).json({status: true} )
    }
    catch (error) {
        res. status (500).json({error: error})
    }


}


getSkills: async(req, res)=> {
    const userId = req.user. id;
   try{
      const skills = await Skills.find( {userId: userId}, {createdAt: 0, updatedAt: 0, _v: 0});
      if(skills. length===0) {
       return res.status (200).json([]);
      }
      res. status (200).json(skills);
    }
     catch (error) {
       res. status(500).json({error: error})
    }

}

deleteSkills: async(req, res)=> {
    const id=req.params.id;
    try{
        await Skill.findByIdAndDelete(id)
        res.status(200).json({status:true})
    }
    catch(error){
        res.status(500).json({error})
    }
}


addAgent: async(req,res)=>{
    const newAgent=new Agent({
        userId: req.user.id,
        uid: req.body.uid,
        working_hrs: req.body.working_hrs,
        hq_address: req.body.hq_address,
        company: req.body.company
    });

    try{
        await newAgent.save();
        await User.findByIdAndDelete(req.user.id,{$set: {agents:true}})
        res.status(200).json({status:true})
    }
    catch(error){
        res.status(500).json({error})
    }
}

updateAgent: async(req,res)=>{
    const id=req.params.id;

    try{
        const updateAgent= await Agent.findByIdAndUpdate(id, {
            working_hrs: req.body.working_hrs,
            hq_address: req.body.hq_address,
            company: req.body.company
        }, {new:true});
        if(!updateAgent){ return res.status(404).json({status:false, message: 'Agent not found'})}
        res.status(200).json({status:true})
    }
    catch(error){
        res.status(500).json({error:error.message})
    }
}

getAgent: async (req,res)=>{
    try{
        const agentData=Agent.find({uid:req.params.uid},{createdAt:0,updatedAt:0,__v:0});

        const agent=agentData[0];

        req.status(200).json(agent);
    }
    catch(error) {
        res.status(500).json({error:error.message})
    }
}

getAgents: async (req, res) => {
    try{
        const agents=User.aggregate([
            {$match:{isAgent:true}},
            {$sample:{size:7}},
            {
                $project:{
                    _id:0,username:1,profile:1,uid:1
                }
            }
        ]);
    
    } 
    catch (error) {
        res.status(500).json({error:error.message})
    }
}