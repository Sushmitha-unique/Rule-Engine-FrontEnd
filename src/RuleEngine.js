import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RuleEngine.css'; 

const RuleEngine = () => {
    const [ruleString, setRuleString] = useState('');
    const [ast, setAst] = useState(null); 
    const [userData, setUserData] = useState('');
    const [evaluationResult, setEvaluationResult] = useState(null);
    const [rules, setRules] = useState([]); 
    const [selectedRuleIds, setSelectedRuleIds] = useState([]);  
    const [error, setError] = useState('');
    const [combineOperator, setCombineOperator] = useState('AND');

    
    const createRule = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/rules', { ruleString });
            setAst(response.data.rule.ast); 
        } catch (error) {
            console.error("Error creating rule:", error);
            alert("Failed to create rule. Please check your input.");
        }
    };

    const evaluateRule = async () => {
        try {
            const data = JSON.parse(userData);
            const response = await axios.post('http://localhost:5000/api/evaluate-rule', { ast, data });
            setEvaluationResult(response.data.result);
        } catch (error) {
            console.error("Error evaluating rule:", error);
            setEvaluationResult(null);
            alert("Failed to evaluate rule. Please ensure your user data is in valid JSON format.");
        }
    };

    useEffect(() => {
        const fetchRules = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/rules');
                setRules(response.data); 
            } catch (err) {
                setError('Failed to fetch rules.');
            }
        };
        fetchRules();
    }, []);

    const handleRuleSelection = (ruleId) => {
        if (selectedRuleIds.includes(ruleId)) {
            setSelectedRuleIds(selectedRuleIds.filter(id => id !== ruleId));  
        } else {
            setSelectedRuleIds([...selectedRuleIds, ruleId]);  
        }
    };

    const handleCombineRules = async () => {
        setError('');
        try {
            const response = await axios.post('http://localhost:5000/api/combine-rules', {
                ruleIds: selectedRuleIds,
                operator: combineOperator  
            });
            setAst(response.data); 
        } catch (err) {
            setError('Failed to combine rules.');
        }
    };

    return (
        <div className="rule-engine-container">
            <h2>Rule Engine</h2>
            <div className="input-section">
                <input
                    type="text"
                    value={ruleString}
                    onChange={(e) => setRuleString(e.target.value)}
                    placeholder="Enter your rule here"
                />
                <button onClick={createRule}>Create Rule</button>
            </div>

            <div>
                <h3>Select Rules to Combine</h3>
                {rules.map((rule) => (
                    <div key={rule._id}>
                        <input
                            type="checkbox"
                            checked={selectedRuleIds.includes(rule._id)}
                            onChange={() => handleRuleSelection(rule._id)}
                        />
                        <label>{rule.ruleString}</label>
                    </div>
                ))}
            </div>

            <div>
                <h3>Select Operator for Combination</h3>
                <select value={combineOperator} onChange={(e) => setCombineOperator(e.target.value)}>
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                </select>
            </div>

            <button onClick={handleCombineRules} disabled={selectedRuleIds.length === 0}>
                Combine Selected Rules
            </button>

            <div className="ast-display">
                <h3>Generated AST:</h3>
                {ast ? <pre>{JSON.stringify(ast, null, 2)}</pre> : <p>No AST generated yet.</p>}
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="evaluation-section">
                <div className="user-data-section">
                    <h3>User Data (JSON Format):</h3>
                    <textarea
                        value={userData}
                        onChange={(e) => setUserData(e.target.value)}
                        placeholder='{"age": 35, "department": "Sales", "salary": 60000, "experience": 3}'
                    />
                    <button onClick={evaluateRule}>Evaluate Rule</button>
                </div>
            </div>

            {evaluationResult !== null && (
                <div className="result-display">
                    <h3>Evaluation Result:</h3>
                    <p>{evaluationResult ? "User is eligible." : "User is not eligible."}</p>
                </div>
            )}
        </div>
    );
};

export default RuleEngine;
